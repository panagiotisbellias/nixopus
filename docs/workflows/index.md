# ⚙️ GitHub Workflows

This document provides an overview of all GitHub Actions workflows defined in this repository under [`.github/workflows/`](https://github.com/raghavyuva/nixopus/tree/master/.github/workflows).

The goal is to explain:
- **What each workflow does** (raw descriptions from issue)
- **Why it was created**
- **How to use or troubleshoot it**
- **What secrets or environment variables it depends on**
- **Executed flow for better understanding of the steps**

---

## 📂 Location
All workflows live in the [`.github/workflows/`](https://github.com/raghavyuva/nixopus/tree/master/.github/workflows) folder.

---

## 🚀 Major Workflows

### 1. `build_container.yml`
- **Description:** Builds and pushes Docker images for the API and the web UI to GitHub’s container registry whenever a version tag is pushed or a release is published.  
- **Why:** Provides reproducible, versioned container images for deployments.  
- **Executed Flow:**  
  1. Checkout repository  
  2. Log in to GitHub Container Registry (GHCR)  
  3. Build Docker images (API + Web UI)  
  4. Push images to GHCR  
- **Secrets/Dependencies:** `GHCR_TOKEN` (or `GITHUB_TOKEN` with package write permissions).  
- **Link:** [Workflow file](https://github.com/raghavyuva/nixopus/tree/master/.github/workflows/build_container.yml)  

---

### 2. `coderabbit.yml`
- **Description:** Uses the Coderabbit AI PR-reviewer to automatically review pull requests when they’re opened, synchronized or reopened.  
- **Why:** Automates PR review to save time and enforce consistency.  
- **Executed Flow:**  
  1. Detect PR open/sync/reopen event  
  2. Trigger Coderabbit API call  
  3. Post review results as PR comments  
- **Secrets/Dependencies:** `CODERABBIT_API_KEY` (if required).  
- **Link:** [Workflow file](https://github.com/raghavyuva/nixopus/tree/master/.github/workflows/coderabbit.yml)  

---

### 3. `docs.yml`
- **Description:** Builds the documentation site with VitePress and deploys it to GitHub Pages on pushes affecting the `docs/**` folder or on manual dispatch.  
- **Why:** Keeps [docs.nixopus.com](https://docs.nixopus.com) up to date automatically.  
- **Executed Flow:**  
  1. Checkout repository  
  2. Install Node.js + dependencies  
  3. Run VitePress build  
  4. Deploy static site to GitHub Pages  
- **Link:** [Workflow file](https://github.com/raghavyuva/nixopus/tree/master/.github/workflows/docs.yml)  

---

### 4. `format.yaml`
- **Description:** Runs code formatters (`gofmt` for the API, Prettier for the frontend and a formatting task for the CLI) on pushes to `master` or `feat/develop` and auto-commits any changes.  
- **Why:** Enforces consistent code style across all components.  
- **Executed Flow:**  
  1. Checkout repository  
  2. Run `gofmt` on API code  
  3. Run `prettier` on frontend code  
  4. Run formatter on CLI  
  5. Auto-commit changes (if any)  
- **Link:** [Workflow file](https://github.com/raghavyuva/nixopus/tree/master/.github/workflows/format.yaml)  

---

### 5. `labeler.yml`
- **Description:** Applies predefined labels to pull requests using `actions/labeler` when a PR is opened, synchronized or reopened.  
- **Why:** Automates PR labeling to simplify triage.  
- **Executed Flow:**  
  1. PR opened/sync/reopen triggers workflow  
  2. Load `.github/labeler.yml` rules  
  3. Apply matching labels to PR  
- **Dependencies:** `.github/labeler.yml` configuration file.  
- **Link:** [Workflow file](https://github.com/raghavyuva/nixopus/tree/master/.github/workflows/labeler.yml)  

---

### 6. `release-cli.yml`
- **Description:** Builds and packages the CLI component (using Poetry and fpm) into various package formats on pushes or pull requests touching the `cli` directory, and then creates a release artifact.  
- **Why:** Produces distributable CLI packages for multiple environments.  
- **Executed Flow:**  
  1. Checkout repository  
  2. Install Python + Poetry  
  3. Build CLI packages (`.deb`, `.rpm`, etc.) with `fpm`  
  4. Upload release artifacts to GitHub Releases  
- **Artifacts:** Release artifacts uploaded to GitHub Releases.  
- **Link:** [Workflow file](https://github.com/raghavyuva/nixopus/tree/master/.github/workflows/release-cli.yml)  

---

### 7. `release.yml`
- **Description:** Uses changelog action to generate a prerelease tag and create a GitHub pre-release whenever code is pushed to `master` or triggered manually.  
- **Why:** Provides prerelease builds for early testing.  
- **Executed Flow:**  
  1. Checkout repository  
  2. Generate changelog  
  3. Create prerelease tag  
  4. Publish GitHub prerelease  
- **Link:** [Workflow file](https://github.com/raghavyuva/nixopus/tree/master/.github/workflows/release.yml)  

---

### 8. `security.yml`
- **Description:** Performs security scans on a weekly schedule or on pushes to key branches; runs Trivy for dependency vulnerabilities and TruffleHog for secret detection.  
- **Why:** Ensures proactive detection of vulnerabilities and secrets.  
- **Executed Flow:**  
  1. Checkout repository  
  2. Run Trivy scan for dependencies  
  3. Run TruffleHog scan for secrets  
  4. Upload scan results to workflow logs  
- **Link:** [Workflow file](https://github.com/raghavyuva/nixopus/tree/master/.github/workflows/security.yml)  

---

### 9. `test.yaml`
- **Description:** Executes Go unit tests on pushes to `master` or `feat/develop` branches.  
- **Why:** Maintains code correctness and prevents regressions.  
- **Executed Flow:**  
  1. Checkout repository  
  2. Set up Go environment  
  3. Run `go test ./...`  
  4. Report test results in workflow logs  
- **Link:** [Workflow file](https://github.com/raghavyuva/nixopus/tree/master/.github/workflows/test.yaml)  

---

## 🔑 Secrets & Environment Variables
Workflows may rely on:
- `GITHUB_TOKEN` → default GitHub token with repo access.
- `GHCR_TOKEN` → for pushing Docker images.
- `CODERABBIT_API_KEY` → for Coderabbit integration.
- Other repository secrets as defined in `Settings > Secrets and variables`.

---

## 🛠️ Troubleshooting Workflows
- **Check Logs:** Review detailed logs under the GitHub Actions tab.  
- **Rerun:** Use the “Re-run jobs” option if a transient error occurs.  
- **Secrets:** Ensure required secrets are set in repository settings.  
- **Permissions:** Verify tokens have the required scopes (e.g., `package:write` for GHCR).  

---

## 📖 References
- [GitHub Actions Documentation](https://docs.github.com/en/actions)  
- [Nixopus Documentation](https://docs.nixopus.com/install/)  
- [Workflows Directory](https://github.com/raghavyuva/nixopus/tree/master/.github/workflows/)  
