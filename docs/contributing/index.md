# Contribution Guidelines

Welcome to the Nixopus Contribution Guidelines. This page serves as an index to our detailed contribution guides. We value and appreciate all contributions to the project, whether they're bug fixes, feature additions, documentation improvements, or any other enhancements.

## Choose Your Contribution Area

Each specialized guide provides detailed instructions for contributing to specific aspects of Nixopus:

| Contribution Guide | Description | Key Topics |
|-------------------|-------------|------------|
| [General Contributing](index.md) | General contribution workflow | Basic setup, making changes, pull request process |
| [Backend Development](backend/backend.md) | Go backend contributions | API features, database migrations, testing |
| [Frontend Development](frontend/frontend.md) | Next.js/React frontend | Component development, Redux integration, UI guidelines |
| [Documentation](documentation/documentation.md) | Documentation improvements | Add contents on features, content guidelines, API docs |


## Code of Conduct

Before contributing, please review and agree to our [Code of Conduct](/code-of-conduct/index.md). We're committed to maintaining a welcoming and inclusive community.

## Development Setup

Before diving into the step by step development setup instructions, you can choose between two setups process:
- <Badge type="tip">Automatic Setup</Badge>: A single script to install all pre-requisite dependencies, install clone the repository, configure ports, launch PSQL container, generate ssh keys and start both backend and frontend in hot reload mode. This is best for setting up repository for the first time.

- <Badge type="tip">Manual Setup</Badge>: In this setup, you will have to individually install Docker, Go, Node.js/Yarn, and Git, and clone the repository, copy and customized your .env files to spin up the database in Docker, giving granular control of your env.

::: details Automatic Setup

We have spent a time making your contribution process hastle free, you just have to run the below command to get started:


#### Prerequisites

> [!IMPORTANT]
> As pre-requisite install Docker & Docker Compose on your machine. <br>
> Given `curl` by default will be available on MacOS / Linux

| Dependency                     | Installation                                                                                                                                                    |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **curl**                       | Assumed present (or install via brew/apt/dnf/yum/pacman)                                                                                                        |
| **Docker Engine + Compose**    | Manual install & ensure daemon is running                                                                                                                       |
| **Go (v1.23.4+)**              | `setup.sh` auto-installs (brew on macOS; apt/dnf/yum/pacman on Linux)                                                                                           |
| **git**                        | `setup.sh` auto-installs (same mechanisms as Go)                                                                                                                |
| **node & npm**                 | `setup.sh` auto-installs (brew on macOS; apt/dnf/yum on Linux) then uses `npm install -g yarn`                                                                  |
| **yarn**                       | `setup.sh` auto-installs alongside node/npm                                                                                                                     |
| **SSH (openssh & ssh-keygen)** | `setup.sh` will install the client if missing (brew on macOS; apt/dnf/yum/pacman on Linux) and generate keys; on macOS you must manually enable “Remote Login.” |

> [!CAUTION]
> Automatic setup isn’t available for Windows. This script only supports Linux and macOS. <br>
> Please refer to the [manual installation instructions](#manual-installation) for Windows.


#### Installation command

> [!WARNING]
> Before running the setup script, verify that the default ports are available. If any are already in use, supply alternative port values when invoking the script.

```bash
sudo bash -c "$(curl -sSL https://raw.githubusercontent.com/raghavyuva/nixopus/refs/heads/master/scripts/setup.sh)"
```

**Check if ports are available:**

<CodeGroup :tabs="[
      { label: 'macOS', code: 'lsof -nP -iTCP:8080,7443,5432 -sTCP:LISTEN' },
      { label: 'Linux', code: 'lsof -nP -iTCP:8080,7443,5432 -sTCP:LISTEN' }]"
/>



If any of them is occupied, you will see the following output:

```bash 
COMMAND     PID      USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
Code\x20H 91083 shravan20   61u  IPv4 0xbb24848baadd8bde      0t0  TCP 127.0.0.1:8080 (LISTEN)
```

#### Using Custom Port Configurations

You can change the port values by running the below commands:

```bash
sudo bash -c "$(curl -sSL \
  https://raw.githubusercontent.com/raghavyuva/nixopus/refs/heads/master/scripts/setup.sh)" \
  --api-port 8081 --view-port 7444 --db-port=5433  # each option is optional
```
##### Default port configurations

| **Service**    | **Port** |
| -------------- | -------- |
| API Server     | 8080     |
| Frontend       | 7443     |
| Database       | 5432     |

:::



::: details Manual Setup

If you prefer to set up your development environment manually, follow these step-by-step instructions:

#### Prerequisites

| Dependency | Installation |
|------------|--------------|
| **Docker Engine + Compose** | [Docker Desktop](https://www.docker.com/products/docker-desktop/) (macOS/Windows) or [Docker Engine](https://docs.docker.com/engine/install/) (Linux) |
| **Go (v1.23.6+)** | [Official Go Downloads](https://golang.org/dl/) or [Go Installation Guide](installing_go.md) |
| **Node.js (v18+)** | [Node.js Downloads](https://nodejs.org/en/download/) or [Node Version Manager](https://github.com/nvm-sh/nvm) |
| **Yarn** | `npm install -g yarn` (after installing Node.js) |
| **Git** | [Git Downloads](https://git-scm.com/downloads) or package manager (brew/apt/dnf/yum/pacman) |

#### Step 1: Clone the Repository
```bash
git clone https://github.com/raghavyuva/nixopus.git
cd nixopus
```

#### Step 2: Configure Environment Variables
```bash
cp .env.sample .env
cp view/.env.sample view/.env
cp api/.env.sample api/.env
```
if you want to see what each variable is for [here](#environment-variables) you can refer this guide
> [!NOTE]
> The root `.env.sample` contains combined configurations for self-hosting. For development.
> We use separate environment files for the API and frontend.

#### Step 3: Set Up PostgreSQL Database using Docker:
```bash
docker run -d \
  --name nixopus-db \
  --env-file ./api/.env \
  -p 5432:5432 \
  -v ./data:/var/lib/postgresql/data \
  postgres:14-alpine
```

#### Step 4: Install Development Tools
Install Air for hot reloading during backend development:
```bash
go install github.com/air-verse/air@latest
```

#### Step 6: Install Project Dependencies

**Backend Dependencies:**
```bash
cd api && go mod download
```


**Frontend Dependencies:**

<CodeGroup :tabs="[
      { label: 'npm', code: 'cd ../view && npm install' },
      { label: 'yarn', code: 'cd ../view && yarn install' },
      { label: 'pnpm', code: 'cd ../view && pnpm install' }
      ]"
/>

#### Step 7: Load Development Fixtures (Recommended)
The fixtures system provides sample data including users, organizations, roles, permissions, and feature flags to help you get started quickly. Learn how to use fixtures in our [Development Fixtures Guide](fixtures.md).

## Running the Application

### Start the Backend API

```bash
cd ../api && air
```

This will start the API server on port `8080`. If everything is set up correctly, it will automatically run database migrations.

Verify the server is running by visiting [`http://localhost:8080/api/v1/health`](http://localhost:8080/api/v1/health) and you should see a **success** message.

### Start the Frontend
Open a new terminal and run:

<CodeGroup :tabs="[
      { label: 'npm', code: 'cd ./view && npm run dev' },
      { label: 'yarn', code: 'cd ./view && yarn dev' },
      { label: 'pnpm', code: 'cd ./view && pnpm dev' }
      ]"
/>

The frontend will be available at [`http://localhost:3000`](http://localhost:3000).

## Next Steps

Now that you have your development environment set up, here are the next steps for contributing:

* **Making Changes** - [Making Changes Guide](getting-involved/making-changes.md)
* **Testing Your Changes** - [Testing Guide](getting-involved/making-changes.md)  
* **Submitting a Pull Request** - [Pull Request Guide](getting-involved/proposing-changes.md)
* **Proposing New Features** - [Feature Proposal Guide](getting-involved/proposing-changes.md)
* **Extending Documentation** - [Documentation Guide](documentation/documentation.md)

## Gratitude

Thank you for contributing to Nixopus! Your efforts help make this project better for everyone.
