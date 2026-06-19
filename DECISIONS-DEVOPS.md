# DECISIONS-DEVOPS.md — Infrastructure decisions

Document at least 3 decisions specific to the infrastructure.

## Format

```
Decision: [what you chose]
Why: [the reason]
Rejected alternative: [What exactly did you evaluate and drop? Avoid generic statements like "we didn't choose X because it's bad.]

```

## Decisions

### Decision 1 - kind (Kubernetes in Docker) for the cluster

```
Decision: Ran the Kubernetes cluster with kind on a single EC2 instance.
Why: kind spins up a full, conformant Kubernetes cluster inside a Docker container in under a minute, with zero cloud cost and no external dependencies. For a hackathon where the goal is to demonstrate container orchestration (Deployments, Services, Ingress, HPA, auto-healing), kind gives me the complete Kubernetes API surface without the provisioning time or billing of a managed service.
Rejected alternative: The other option was EKS. It would have given me a managed control plane, multi-node scheduling, real high availability, and a cloud load balancer, but it takes about 15–20 minutes to provision, costs money per hour.
```
### Decision 2 - Managed RDS (MySQL) instead of an in-cluster database

```
Decision: Provisioned the database as an external AWS RDS MySQL instance via Terraform, separate from the cluster.
Why: State must outlive compute. The application Pods are disposable, they can be killed, rescheduled, or wiped together with the cluster at any time without losing anything. If the database lived in a Pod, destroying the cluster or losing the Pod would destroy the data. RDS keeps the data on managed, persistent storage with automated backups, fully decoupled from the application lifecycle.
Rejected alternative: I evaluated running MySQL as a Pod with a PersistentVolume inside kind. On a single-node kind cluster the volume is just a host path on the same EC2 box, so it offers no real durability if the instance dies, the data goes with it, and I'd also be responsible for backups, upgrades, and failover myself. RDS gives all of that managed.
```
### Decision 3 - ClusterIP Services behind a single Ingress, not NodePort or LoadBalancer per service

```
Decision: Exposed the application through an Nginx Ingress Controller, with the application Service kept internal as ClusterIP.
Why: A single, controlled front door. Ingress terminates external traffic on port 80 and routes by path to internal ClusterIP Services, which are only reachable from inside the cluster. This keeps one auditable ingress point instead of scattering exposed ports across the node.
Rejected alternative: I evaluated NodePort and LoadBalancer. Both either widen the attack surface or simply don't work cleanly on a single-node kind cluster. Ingress lets the controller bind directly to port 80 of the EC2 host.
```
---

## Troubleshooting

Document at least 3 real problems you hit and how you solved them.

### Problem 1 — Application crashed on startup: `ModuleNotFoundError: No module named 'pymysql'

The app failed to connect to the database on first deploy. The connection string used the pymysql SQLAlchemy dialect, but the application's requirements.txt ships mysql-connector-python, not pymysql.

Fix: Changed the DB_URL dialect from mysql+pymysql://... to mysql+mysqlconnector://..., matching the driver that's actually installed. The app connected to RDS immediately after.

### Problem 2 — Pipeline failed at the unit-test step: missing python3-venv

The first CI/CD run failed because the test step tried to create a virtualenv, but the EC2 instance (where the self-hosted runner lives) didn't have python3-venv installed.

Fix: Installed the missing system packages on the runner host: sudo apt install -y python3-venv python3-pip. Re-ran the pipeline and it passed end to end.

### Problem 3 — metrics-server not working on kind (HPA showed `<unknown>` for CPU)

HPA had no CPU metric to scale on because metrics-server couldn't talk to the kubelets, kind nodes don't have valid TLS certs for the metrics path, so metrics-server refused the connection.

Fix: Installed metrics-server with --kubelet-insecure-tls, which tells it to skip kubelet certificate verification. After that, HPA started reading CPU usage correctly and scaling worked.

---

## k6 load test results

Script: devops/load-tests/load_test.js simulates virtual users virtual users in three stages: 30s up to 50 VUs, 1 min up to 100 VUs, then 30s back down to 0. Each iteration hit GET /health and POST /vector.

Result: Under sustained load the CPU on the application Pods crossed the HPA target of 50%, and the HorizontalPodAutoscaler scaled the deployment from 1 replica up to 10. On the single-node kind cluster, 8 Pods reached Running and 2 stayed Pending, the scheduler had no remaining node resources to place them, which is expected behaviour on one node. After the test, the HPA scaled the deployment back down.

---

## What I learned

- Separate state from compute, always. The cleanest decision I made was keeping the database in RDS and treating the cluster as fully disposable. It meant that even if the EC2 instance died, nothing irreplaceable was lost, code is on GitHub, infrastructure is in Terraform, data is in RDS and a full rebuild.

- Everything-as-code pays off the moment something breaks. Because the cluster, the deploy, and the RDS were all described in files (kind config, Helm charts, Terraform), recovery is repeatable. Clicking things in a console feels faster at first but leaves you with nothing to re-run.

- Secrets discipline is about every stage, not one. The database password passes through three separate mechanisms: TF_VAR_db_password for Terraform, GitHub Secrets injected by Helm into the Pod, and a Kubernetes Secret in etcd for the CronJob but it never lives in none of them inside Git.

- The CI/CD loop only closes if the runner can reach the cluster. Understanding why the runner had to be self-hosted and co-located, because kind load and helm install are local operations, was the key insight that made the whole pipeline make sense rather than just copy commands.
