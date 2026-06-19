#!/usr/bin/env bash
# =============================================================================
# Builders Lab Hackathon 2026 — DevOps Bootstrap
# =============================================================================
# Installs all required tooling for the DevOps track:
#   - Docker
#   - kind (Kubernetes IN Docker)
#   - kubectl
#   - helm
#   - terraform
#   - k6
#
# Supported platforms:
#   - Linux (Ubuntu / Debian)
#   - macOS (Intel & Apple Silicon, requires Homebrew)
#   - Windows via WSL2 (Ubuntu)
#
# Usage:
#   chmod +x bootstrap.sh
#   ./bootstrap.sh
#
# The script is idempotent — safe to run multiple times. It will skip
# anything that's already installed at the right version.
#
# What it does NOT do:
#   - create a kind cluster (you do that yourself)
#   - install a self-hosted GitHub Actions runner
#   - configure AWS credentials
# =============================================================================

set -euo pipefail

# -----------------------------------------------------------------------------
# Pinned versions — bump as needed
# -----------------------------------------------------------------------------
KIND_VERSION="v0.24.0"
KUBECTL_VERSION="v1.31.0"
HELM_VERSION="v3.16.1"
TERRAFORM_VERSION="1.9.8"
K6_VERSION="v0.54.0"

# -----------------------------------------------------------------------------
# Pretty output
# -----------------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}[INFO]${NC}  $*"; }
log_ok()      { echo -e "${GREEN}[OK]${NC}    $*"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }
log_section() { echo -e "\n${BOLD}=== $* ===${NC}"; }

# -----------------------------------------------------------------------------
# Platform detection
# -----------------------------------------------------------------------------
detect_platform() {
  local os arch is_wsl=false

  case "$(uname -s)" in
    Linux*)
      os="linux"
      if grep -qi microsoft /proc/version 2>/dev/null || \
         grep -qi microsoft /proc/sys/kernel/osrelease 2>/dev/null; then
        is_wsl=true
      fi
      ;;
    Darwin*) os="darwin" ;;
    *)
      log_error "Unsupported OS: $(uname -s)"
      log_error "Supported: Linux, macOS, Windows (via WSL2)"
      exit 1
      ;;
  esac

  case "$(uname -m)" in
    x86_64|amd64)  arch="amd64" ;;
    arm64|aarch64) arch="arm64" ;;
    *)
      log_error "Unsupported architecture: $(uname -m)"
      exit 1
      ;;
  esac

  PLATFORM_OS="$os"
  PLATFORM_ARCH="$arch"
  PLATFORM_IS_WSL="$is_wsl"

  log_info "Detected platform: ${os}/${arch} $([ "$is_wsl" = true ] && echo "(WSL2)")"
}

# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------
need_cmd() {
  command -v "$1" >/dev/null 2>&1
}

require_sudo() {
  if [ "$(id -u)" -ne 0 ] && ! need_cmd sudo; then
    log_error "This script needs root or sudo access for installing tools on Linux."
    exit 1
  fi
}

# Choose the right install dir (no sudo on macOS Homebrew bin, sudo on Linux /usr/local/bin)
INSTALL_DIR="/usr/local/bin"
maybe_sudo() {
  if [ "$(id -u)" -eq 0 ]; then
    "$@"
  else
    sudo "$@"
  fi
}

# Compare installed version vs required (returns 0 if match)
version_matches() {
  local installed="$1"
  local required="$2"
  # strip leading "v" for comparison
  installed="${installed#v}"
  required="${required#v}"
  [ "$installed" = "$required" ]
}

# -----------------------------------------------------------------------------
# Docker
# -----------------------------------------------------------------------------
install_docker() {
  log_section "Docker"

  if need_cmd docker && docker info >/dev/null 2>&1; then
    log_ok "Docker already installed and running ($(docker --version))"
    return
  fi

  if need_cmd docker; then
    log_warn "Docker is installed but daemon is not running."
    case "$PLATFORM_OS" in
      darwin) log_warn "Start Docker Desktop manually." ;;
      linux)  log_warn "Start it with: sudo systemctl start docker" ;;
    esac
    return
  fi

  case "$PLATFORM_OS" in
    linux)
      log_info "Installing Docker via official convenience script..."
      curl -fsSL https://get.docker.com | maybe_sudo sh
      maybe_sudo usermod -aG docker "$USER" || true
      log_warn "You may need to log out and back in for the docker group to apply."
      log_warn "Or run: newgrp docker"
      ;;
    darwin)
      if need_cmd brew; then
        log_info "Installing Docker Desktop via Homebrew..."
        brew install --cask docker
        log_warn "Open Docker Desktop manually once to complete setup."
      else
        log_error "Homebrew is required on macOS. Install from https://brew.sh"
        exit 1
      fi
      ;;
  esac

  log_ok "Docker installed."
}

# -----------------------------------------------------------------------------
# kind
# -----------------------------------------------------------------------------
install_kind() {
  log_section "kind"

  if need_cmd kind; then
    local current
    current="$(kind --version | awk '{print $3}')"
    if version_matches "$current" "$KIND_VERSION"; then
      log_ok "kind ${KIND_VERSION} already installed"
      return
    else
      log_warn "kind ${current} found, upgrading to ${KIND_VERSION}..."
    fi
  fi

  local url="https://kind.sigs.k8s.io/dl/${KIND_VERSION}/kind-${PLATFORM_OS}-${PLATFORM_ARCH}"
  local tmp
  tmp="$(mktemp)"

  log_info "Downloading kind ${KIND_VERSION}..."
  curl -fsSL -o "$tmp" "$url"
  chmod +x "$tmp"
  maybe_sudo mv "$tmp" "${INSTALL_DIR}/kind"

  log_ok "kind installed: $(kind --version)"
}

# -----------------------------------------------------------------------------
# kubectl
# -----------------------------------------------------------------------------
install_kubectl() {
  log_section "kubectl"

  if need_cmd kubectl; then
    local current
    current="$(kubectl version --client -o json 2>/dev/null | grep -o '"gitVersion":"[^"]*' | head -1 | cut -d'"' -f4)"
    if version_matches "$current" "$KUBECTL_VERSION"; then
      log_ok "kubectl ${KUBECTL_VERSION} already installed"
      return
    else
      log_warn "kubectl ${current} found, upgrading to ${KUBECTL_VERSION}..."
    fi
  fi

  local url="https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/${PLATFORM_OS}/${PLATFORM_ARCH}/kubectl"
  local tmp
  tmp="$(mktemp)"

  log_info "Downloading kubectl ${KUBECTL_VERSION}..."
  curl -fsSL -o "$tmp" "$url"
  chmod +x "$tmp"
  maybe_sudo mv "$tmp" "${INSTALL_DIR}/kubectl"

  log_ok "kubectl installed: $(kubectl version --client --output=yaml | grep gitVersion | head -1 | awk '{print $2}')"
}

# -----------------------------------------------------------------------------
# helm
# -----------------------------------------------------------------------------
install_helm() {
  log_section "helm"

  if need_cmd helm; then
    local current
    current="$(helm version --short | cut -d'+' -f1)"
    if version_matches "$current" "$HELM_VERSION"; then
      log_ok "helm ${HELM_VERSION} already installed"
      return
    else
      log_warn "helm ${current} found, upgrading to ${HELM_VERSION}..."
    fi
  fi

  local archive="helm-${HELM_VERSION}-${PLATFORM_OS}-${PLATFORM_ARCH}.tar.gz"
  local url="https://get.helm.sh/${archive}"
  local tmpdir
  tmpdir="$(mktemp -d)"

  log_info "Downloading helm ${HELM_VERSION}..."
  curl -fsSL -o "${tmpdir}/${archive}" "$url"
  tar -xzf "${tmpdir}/${archive}" -C "$tmpdir"
  maybe_sudo mv "${tmpdir}/${PLATFORM_OS}-${PLATFORM_ARCH}/helm" "${INSTALL_DIR}/helm"
  rm -rf "$tmpdir"

  log_ok "helm installed: $(helm version --short)"
}

# -----------------------------------------------------------------------------
# terraform
# -----------------------------------------------------------------------------
install_terraform() {
  log_section "terraform"

  if need_cmd terraform; then
    local current
    current="$(terraform version -json 2>/dev/null | grep -o '"terraform_version":"[^"]*' | cut -d'"' -f4)"
    if version_matches "$current" "$TERRAFORM_VERSION"; then
      log_ok "terraform ${TERRAFORM_VERSION} already installed"
      return
    else
      log_warn "terraform ${current} found, upgrading to ${TERRAFORM_VERSION}..."
    fi
  fi

  local archive="terraform_${TERRAFORM_VERSION}_${PLATFORM_OS}_${PLATFORM_ARCH}.zip"
  local url="https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/${archive}"
  local tmpdir
  tmpdir="$(mktemp -d)"

  log_info "Downloading terraform ${TERRAFORM_VERSION}..."
  curl -fsSL -o "${tmpdir}/${archive}" "$url"

  if ! need_cmd unzip; then
    log_info "unzip not found, installing..."
    case "$PLATFORM_OS" in
      linux)  maybe_sudo apt-get update -qq && maybe_sudo apt-get install -y -qq unzip ;;
      darwin) brew install unzip ;;
    esac
  fi

  unzip -q "${tmpdir}/${archive}" -d "$tmpdir"
  maybe_sudo mv "${tmpdir}/terraform" "${INSTALL_DIR}/terraform"
  rm -rf "$tmpdir"

  log_ok "terraform installed: $(terraform version | head -1)"
}

# -----------------------------------------------------------------------------
# k6
# -----------------------------------------------------------------------------
install_k6() {
  log_section "k6"

  if need_cmd k6; then
    local current
    current="$(k6 version | awk '{print $2}' | head -1)"
    if version_matches "$current" "$K6_VERSION"; then
      log_ok "k6 ${K6_VERSION} already installed"
      return
    else
      log_warn "k6 ${current} found, upgrading to ${K6_VERSION}..."
    fi
  fi

  # k6 release archives use slightly different arch names
  local k6_arch="$PLATFORM_ARCH"
  local archive="k6-${K6_VERSION}-${PLATFORM_OS}-${k6_arch}.tar.gz"
  local url="https://github.com/grafana/k6/releases/download/${K6_VERSION}/${archive}"
  local tmpdir
  tmpdir="$(mktemp -d)"

  log_info "Downloading k6 ${K6_VERSION}..."
  curl -fsSL -o "${tmpdir}/${archive}" "$url"
  tar -xzf "${tmpdir}/${archive}" -C "$tmpdir"
  maybe_sudo mv "${tmpdir}/k6-${K6_VERSION}-${PLATFORM_OS}-${k6_arch}/k6" "${INSTALL_DIR}/k6"
  rm -rf "$tmpdir"

  log_ok "k6 installed: $(k6 version | head -1)"
}

# -----------------------------------------------------------------------------
# Pre-flight checks
# -----------------------------------------------------------------------------
preflight() {
  log_section "Pre-flight checks"

  if ! need_cmd curl; then
    log_error "curl is required but not installed."
    case "$PLATFORM_OS" in
      linux)  log_error "Install with: sudo apt-get install -y curl" ;;
      darwin) log_error "curl should be available by default on macOS." ;;
    esac
    exit 1
  fi
  log_ok "curl available"

  if [ "$PLATFORM_OS" = "darwin" ] && ! need_cmd brew; then
    log_error "Homebrew is required on macOS. Install from https://brew.sh first."
    exit 1
  fi

  if [ "$PLATFORM_OS" = "linux" ]; then
    require_sudo
    log_ok "sudo available"
  fi
}

# -----------------------------------------------------------------------------
# Final summary
# -----------------------------------------------------------------------------
summary() {
  log_section "Summary"

  echo "Installed versions:"
  echo "  docker:    $(docker --version 2>/dev/null || echo 'NOT FOUND')"
  echo "  kind:      $(kind --version 2>/dev/null || echo 'NOT FOUND')"
  echo "  kubectl:   $(kubectl version --client --output=yaml 2>/dev/null | grep gitVersion | head -1 | awk '{print $2}' || echo 'NOT FOUND')"
  echo "  helm:      $(helm version --short 2>/dev/null || echo 'NOT FOUND')"
  echo "  terraform: $(terraform version 2>/dev/null | head -1 || echo 'NOT FOUND')"
  echo "  k6:        $(k6 version 2>/dev/null | head -1 || echo 'NOT FOUND')"

  echo ""
  log_ok "Bootstrap complete!"
  echo ""
  echo "Next steps:"
  echo "  1. Make sure Docker is running:  docker info"
  echo "  2. Create your kind cluster:     kind create cluster --name hackathon --config kind-config.yaml"
  echo "  3. Verify kubectl access:        kubectl cluster-info"
  echo ""

  if [ "$PLATFORM_OS" = "linux" ]; then
    if ! groups | grep -q docker; then
      log_warn "You are not yet in the 'docker' group in this shell."
      log_warn "Run 'newgrp docker' or log out and back in to fix."
    fi
  fi
}

# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------
main() {
  echo -e "${BOLD}Builders Lab Hackathon 2026 — DevOps Bootstrap${NC}"
  echo "============================================="

  detect_platform
  preflight

  install_docker
  install_kind
  install_kubectl
  install_helm
  install_terraform
  install_k6

  summary
}

main "$@"
