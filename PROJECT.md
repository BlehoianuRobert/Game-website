# Game Platform — [Platform Name]

> **Platform name:** each team will propose their own name for the platform they build. Make it yours.

## Builders Lab Hackathon 2026

## Table of Contents

- [The Challenge](#the-challenge)
- [Team Roles](#team-roles)
- [What You're Building](#what-youre-building)
  - [Task 1 — API: Players, Games & Progression](#task-1--api-players-games--progression)
  - [Task 2 — CMS: Content Management System (Admin Panel)](#task-2--cms-content-management-system-admin-panel)
  - [Task 3 — DevOps & Infrastructure](#task-3--devops--infrastructure)
  - [Task 4 — QA Automation: Testing Strategy](#task-4--qa-automation-testing-strategy)
  - [Task 5 — Team Integration: Facilitating Easy Onboarding](#task-5--team-integration-facilitating-easy-onboarding)
- [GitHub Repository Structure](#github-repository-structure)
- [Deliverables](#deliverables)
- [Schedule & Presentation](#schedule--presentation)
- [Evaluation](#evaluation)

---

## The Challenge

Our company is building **[Platform Name]**, an online gaming platform built for two audiences: **players** who play the games, and **game teams** who build and ship them. The platform hosts multiple games with thousands of simultaneous players, each game evolving over time with its own versions. You will build the technical infrastructure that serves both: authentication, profiles, items and gifts, leaderboards, and an administration panel.

Each game team has its own stack (a mobile client, a game server, a PC client), is always in a race against time, and may be working on one or more games simultaneously. All of them need the same things: authentication, player profiles, items and gifts, and a leaderboard. Your platform should make this integration easy.

**The goal:** build the platform end-to-end. That means a backend API that players and game teams interact with, an admin panel to manage everything without writing code, the infrastructure to run it reliably, automated tests that validate the critical flows, and a clear path for a new game team to go from zero to their first published score.

No technology is imposed. Use what you know. Focus on building something that works, designing with scalability in mind is fine, but optimizing for it is not the goal. **You may use any AI tool** (ChatGPT, Claude, Gemini, Copilot, Codex) to write code, but you must understand what you built. You will be asked.

> **Note on definitions:** the task descriptions leave room for interpretation on purpose. Part of what we evaluate is how you approach open-ended problems: what you ask, what you research, and how you justify the choices you make. Mentors are available for this kind of question.

---

## Team Roles

Each team has 5 members. Everyone contributes to the shared repository, but each person owns a task. Each team member picks their own role at the start. Roles are a guide, not a wall. Help each other.

| Role | Task |
|------|-------|
| **API Engineer** | Task 1 — Backend REST API |
| **CMS Engineer** | Task 2 — Admin Panel (Content Management System) |
| **DevOps Engineer** | Task 3 — Infrastructure & CI/CD |
| **QA Automation Engineer** | Task 4 — Testing strategy & automated tests |
| **Platform Engineer** | Task 5 — Team Integration & SDK |

---

## What You're Building

> **Team tip:** before writing any code, consider defining the OpenAPI spec together as a team. Each role has input that shapes it: **CMS Engineer** knows what data to display, **QA Engineer** knows what flows to test, **Platform Engineer** knows what the SDK needs. It's the fastest way to align everyone from day one.

### Task 1 — API: Players, Games & Progression

**Owner: API Engineer**


A **REST API** is a backend service that exposes data and functionality over HTTP, allowing clients (web, mobile, game) to interact with the platform through structured requests and responses.

- **Players & Authentication** — Register, login, account management. Only authenticated players may access platform resources.
- **Player Profile & Progress** — Each player has a profile and an item inventory. Players accumulate progress over time, readable and updatable via the API.
- **Games & Versions** — The platform hosts multiple games, each with its own versions, some active, some not. A player can participate in multiple games simultaneously.
- **Items, Gifts & Leaderboard** — Each game has specific items that players can own and send as gifts to other players. A gift has a lifecycle, the sender sends it, the recipient responds. Players are ranked in a leaderboard based on their progress.

Work with your team to define the data model and endpoints, then own the implementation and authentication strategy. **Start with the contract:** define your OpenAPI spec before writing code. Even a partial spec unblocks the **CMS Engineer**, the **QA Engineer**, and the **Platform Engineer** immediately. Document your decisions in `DECISIONS-API.md`.

> **What stands out:** a spec the rest of the team can integrate against immediately, a clear authentication strategy, and endpoints that actually run at the demo.

---

### Task 2 — CMS: Content Management System (Admin Panel)

**Owner: CMS Engineer**

A Content Management System (CMS) is an interface that allows non-technical users to manage platform content without writing code.

An admin must be able to manage the platform: **Players & Authentication**, **Player Profile & Progress**, **Games & Versions**, and **Items, Gifts & Leaderboard**.

The entities you manage are defined by Task 1's API spec. You follow it, you don't invent it. As a first step, you can connect directly to a database. The ideal final step is connecting through the API, keeping business logic in one place.

**You decide** what technology to use for the admin panel, how it connects to the API, and what the interface looks like. Document your decisions in `DECISIONS-CMS.md`.

> A functional admin panel that lets an admin manage the platform is the baseline. **What stands out:** a clean interface, thoughtful UX decisions, and a panel connected to the data.

---

### Task 3 — DevOps & Infrastructure

**Owner: DevOps Engineer**

The DevOps track simulates building real infrastructure for the platform that the other roles are building. You **do not depend** on your teammates' progress, you start from a self-contained microservice called **Vector API** (a minimal Python app provided in `devops/app/`). If the backend API is ready, you can swap it in as a bonus.

**Key areas:** EC2, Docker, Kubernetes (kind), Helm, CI/CD (GitHub Actions), observability (Prometheus and Grafana), Terraform + AWS, load testing (k6), auto-scaling (HPA).

> Full specification: **TASK-DEVOPS.md**

---

### Task 4 — QA Automation: Testing Strategy

**Owner: QA Automation Engineer**

Testing does not start after the application is ready, it starts in parallel with development. Document in `qa/AUTOMATION_STRATEGY.md` what features are priorities, what types of tests you implement, what tools you use, and how they will be run.

Implement at least 3 tests that validate critical flows from the API or CMS. You don't need to wait for the full API to start. As soon as a partial OpenAPI spec exists, use it as a reference to write tests with hardcoded responses, then replace them with real calls as the API is built. Show both stages at the demo: hardcoded responses first, then the same tests running against the real API.

In `qa/examples/` you will find two starter examples, one in Python (pytest) and one in JavaScript (Playwright). You are not limited to these tools.

> A documented strategy and 3 passing tests are the baseline. **What stands out:** tests that cover meaningful flows (not just happy paths), a clear explanation of why those flows were prioritized, and evidence that testing shaped how the API was built, not just validated it after the fact.

---

### Task 5 — Team Integration: Facilitating Easy Onboarding

**Owner: Platform Engineer**

An SDK (Software Development Kit) is a client library that developers integrate into their application to interact with a platform without writing raw HTTP calls or reading through API documentation. Build one that a game team can drop into their project and use immediately.

The focus is on the core integration path: **Players & Authentication**, **Player Profile & Progress**, and **Items, Gifts & Leaderboard**.

Build a minimal class or script in C++, C#, Python, JavaScript, or any language, with a clean interface a game can call directly. At the presentation, you run it live against the real API instead of showing Postman requests.

**The document:** `TEAM_INTEGRATION.md` must answer the following questions:

> *Tomorrow, a new game team wants to integrate with your platform.*
> - *What do you give them?*
> - *What does their journey from zero to the first published score look like?*
> - *How do you facilitate fast and easy integration?*

This is a design question that touches every role:

- **API** — are your endpoints discoverable? do you provide a contract (e.g. OpenAPI spec)?
- **CMS** — what can a new team self-serve without asking anyone?
- **DevOps** — how does a new team deploy or test against your platform?
- **QA** — how do you give a new team confidence that their integration works?

> A written answer to the integration question and a basic SDK with a solid technical explanation are the baseline. **What stands out:** the SDK runs live at the demo with the full flow working against the real API, a clear explanation of the integration journey, and evidence that you thought about the game team's experience, not just the technical implementation.

---

## GitHub Repository Structure

You will receive access to a private GitHub repository. This is your workspace for the entire hackathon.

### Required repository structure

```
/
├── DECISIONS.md                 ← team-wide decisions (REQUIRED)
├── DECISIONS-API.md             ← API decisions (REQUIRED)
├── DECISIONS-CMS.md             ← CMS decisions (REQUIRED)
├── DECISIONS-DEVOPS.md          ← DevOps decisions + troubleshooting + k6 (REQUIRED)
├── TEAM_INTEGRATION.md          ← integration strategy (REQUIRED)
│
├── src/
│   ├── api/                     ← owned by API Engineer
│   │   ├── README.md            ← how to install and run the API (REQUIRED)
│   │   └── openapi.yaml         ← API contract (REQUIRED)
│   ├── cms/                     ← owned by CMS Engineer
│   │   └── README.md            ← how to install and run the CMS (REQUIRED)
│   └── sdk/                     ← owned by Platform Engineer
│       └── README.md            ← how to install and use the SDK (REQUIRED)
│
├── qa/                          ← everything QA owns
│   ├── AUTOMATION_STRATEGY.md   ← testing strategy (REQUIRED)
│   ├── tests/                   ← automated tests
│   └── examples/                ← provided by organizers, do not modify
│       ├── README.md
│       ├── test_api_example.py
│       └── example.spec.js
│
├── devops/                      ← everything DevOps owns
│   ├── app/                     ← Vector API microservice
│   ├── helm/                    ← Helm chart for deployment
│   ├── k8s/                     ← Helm charts + Kubernetes manifests
│   ├── terraform/               ← IaC for AWS
│   ├── load-tests/              ← k6 scripts
│   ├── bootstrap.sh             ← installs required utilities
│   └── kind-config.yaml         ← cluster config to map Ingress ports
│
└── .github/
    └── workflows/               ← CI/CD pipelines (owned by DevOps Engineer)
```

### src/api/README.md, src/cms/README.md, and src/sdk/README.md — must contain
- How to install dependencies
- How to start the application (one command if possible)
- What port the API uses / how to access the admin panel

### src/sdk/README.md — must contain
- How to install the SDK
- How to use it — at minimum: authentication, score submission, leaderboard, and player profile operations (read and update)

### DECISIONS.md — must contain
At least 5 team-wide decisions, things that affect the whole project, not one role. Examples: choice of programming language per component, database choice, authentication strategy, how the team agreed on the OpenAPI spec, deployment approach. Use this format:

```
Decision: [what you chose]
Why: [the reason]
Rejected alternative: [what you considered and why not]
```

End with:

```
## What we learned as a team
- What worked well technically and what didn't?
- Which decision turned out to be wrong after you implemented it?
- What slowed the team down the most?
- What would you change about the stack or architecture?
- Would you use the same approach for a real project?
- What would you do differently with more time?
```

### DECISIONS-API.md — must contain
At least 3 decisions specific to the API: data model, authentication approach, endpoint design, database schema choices, OpenAPI spec design. End with a "What I learned" section.

### DECISIONS-CMS.md — must contain
At least 3 decisions specific to the admin panel: technology choice, connecting to DB vs API, UI framework. End with a "What I learned" section.

### DECISIONS-DEVOPS.md — must contain
- At least 3 justified infrastructure decisions (same format as above)
- A **troubleshooting** section: at least 3 real problems encountered and how they were solved
- Interpretation of the k6 load test results
- End with a "What I learned" section

> Every individual DECISIONS file (API, CMS, DevOps), `qa/AUTOMATION_STRATEGY.md`, and `TEAM_INTEGRATION.md` must end with a **"What I learned"** section. Write it in your own words. The questions below are just examples, not a required format:
> - How did the collaboration feel, working with people you just met?
> - When you were stuck, who helped and how?
> - Were there moments of disagreement? How did you decide?
> - Did someone take on a leadership role naturally? What did that look like?
> - What didn't you know before that you know now?

### Git Rules

Each team member works on their own branch and merges into `main`. You can use the command line or **GitHub Desktop** if you prefer a visual interface:

```
git checkout -b feature/api        # create your branch
git add .
git commit -m "add player endpoint"
git push origin feature/api        # push to remote
# then open a Pull Request → main, or merge directly
```

- **First commit within the first 30 minutes** of start
- Mandatory commit at the end of Day 1
- **Only what is merged into `main` is evaluated**

---

## Deliverables

**Task 1 — API**
- `openapi.yaml` — API contract defined before implementation
- Working REST API covering: **Players & Authentication**, **Player Profile & Progress**, **Games & Versions**, **Items, Gifts & Leaderboard**
- Authentication implemented and enforced
- `DECISIONS-API.md` with technical decisions documented

**Task 2 — CMS**
- Admin panel accessible in the browser
- Admin can manage: **Players & Authentication**, **Player Profile & Progress**, **Games & Versions**, **Items, Gifts & Leaderboard**
- As a first step, the panel can connect directly to a database. Connecting through the API is the ideal final step
- `DECISIONS-CMS.md` with technical decisions documented

**Task 3 — DevOps**
- Infrastructure running: EC2, RDS, containerized app, Kubernetes cluster, self-hosted GitHub Actions runner, CI/CD pipeline, observability stack (Prometheus + Grafana)
- k6 load test script in `devops/load-tests/` and a Grafana screenshot showing HPA scaling under load
- `DECISIONS-DEVOPS.md` with at least 3 justified decisions, a troubleshooting section (min 3 real problems encountered), and k6 load test interpretation

**Task 4 — QA**
- `qa/AUTOMATION_STRATEGY.md` with the testing strategy and a "What I learned" section
- At least 3 automated tests in `qa/tests/` that run and pass live during the demo

**Task 5 — Team Integration**
- `TEAM_INTEGRATION.md` answering the integration question explicitly, with a "What I learned" section
- SDK running live at the demo. The full flow works against the real API
- `src/sdk/README.md` with install and usage instructions

**All tasks**
- GitHub repository with complete code merged into `main`
- `src/api/README.md`, `src/cms/README.md`, and `src/sdk/README.md` present and up to date
- Live demo, application running on your machine

---

## Schedule & Presentation

### Day 1 — Build

| Time | Activity |
|------|----------|
| 09:00 | Registration & welcome |
| 11:00 | Coding starts, first commit by 11:30 |
| 13:00 – 14:00 | Lunch break |
| 18:00 | Mandatory commit, Day 1 ends |

### Day 2 — Present

| Time | Activity |
|------|----------|
| 09:00 | Coding resumes (final polish only) |
| 12:00 | Push your final commit and start preparing your demo |
| 12:30 | Lunch break |
| 13:30 – 16:20 | Presentations |
| 17:10 | Results announcement & feedback |
| 18:00 | End of the hackathon & networking |

### Presentation Format (per team — 15 min)

| Segment | Who presents |
|---------|--------------|
| Live application demo | whole team |
| API — architecture and key decisions | API Engineer |
| CMS — walkthrough and decisions | CMS Engineer |
| DevOps — CI/CD demo, k6 test and decisions | DevOps Engineer |
| QA — automation strategy, tests running live | QA Engineer |
| Platform — SDK live demo + integration question | Platform Engineer |

The live demo should show the application actually running, not slides. Tests should run in the terminal during the QA segment.

---

## Evaluation

**The score is per team**, everyone on the team receives the same final score. You succeed together or struggle together. This is intentional: we want to see how you collaborate with people you just met.

**The Q&A is individual**, not to penalize anyone, but to see whether the team actually communicated. Each person will be asked about the whole system, not just their own module. If your teammate was blocked and you helped them, that will show. If you worked in isolation, that will also show.

> If someone on your team is stuck, it is in your interest to help them.

| Criterion | Base | Full | Points |
|-----------|------|------|--------|
| OpenAPI Spec | — | complete, well-reasoned spec defined as a team | 5p |
| API Engineer | documented design + partial implementation | working endpoints, live demo | 15p |
| CMS Engineer | described + partial UI (direct DB connection acceptable) | functional admin panel connected through the API | 15p |
| DevOps Engineer | `DECISIONS-DEVOPS.md` + AWS infra setup + kind running + Dockerfile + installed helm charts | full CI/CD pipeline + k6 load test + Grafana screenshot of HPA scaling | 15p |
| QA Engineer | strategy documented | tests run and pass live in demo | 15p |
| Platform Engineer | written answer to the integration question + basic SDK | SDK runs live against the real API built by the team | 15p |
| Presentation & Q&A | — | each member can answer questions about the whole system | 20p (4p/member) |

---

*Good luck! Mentors are available throughout, don't hesitate to ask.*
