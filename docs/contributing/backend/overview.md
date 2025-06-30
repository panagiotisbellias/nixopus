# Contributing to Backend

This guide provides detailed instructions for contributing to the Nixopus backend codebase. Whether you're fixing bugs, adding new features, or improving existing functionality, this guide will help you get started quickly.

<Badge type="tip">Quick Start</Badge> If you're new to Go development or this codebase, start with the [General Contributing Guide](../index.md) first for the complete setup process.

## Setup for Backend Development

<Badge type="info">Prerequisites</Badge> Before you begin, ensure you have the following tools installed on your system:

| Dependency | Version/Details |
|------------|----------------|
| **Go** | 1.23.6 or newer |
| **PostgreSQL** | Any recent version |
| **Docker and Docker Compose** | Recommended for easy setup |
| **Git** | Any recent version |

2. **Environment Setup**

<Badge type="warning">Important</Badge> Make sure you have Docker running before executing these commands.

```bash
# Clone the repository
git clone https://github.com/raghavyuva/nixopus.git
cd nixopus
```

### Copy environment templates
These files contain configuration for database connections, API keys, and other settings
```
cp api/.env.sample api/.env
```

### Set up PostgreSQL database using Docker
This creates a containerized database that's isolated from your system

```
docker run -d \
  --name nixopus-db \
  --env-file ./api/.env \
  -p 5432:5432 \
  -v ./data:/var/lib/postgresql/data \
  postgres:14-alpine
```

### Install development tools and dependencies
```
go install github.com/air-verse/air@latest  # Hot reload tool for Go development
cd api
go mod download  # Download Go dependencies
```

3. **Loading Development Fixtures**

<Badge type="tip">Recommended</Badge> Fixtures provide sample data to help you develop and test features without starting from scratch.

The project includes a comprehensive fixtures system for development and testing. You can load sample data using the following commands:

```bash

# Load fixtures without affecting existing data
make fixtures-load

# Drop and recreate all tables, then load fixtures (clean slate)
make fixtures-recreate

# Truncate all tables, then load fixtures
make fixtures-clean

# Get help on fixtures commands
make fixtures-help
```

**Available Fixture Files:**

| Fixture File | Description |
|--------------|-------------|
| `complete.yml` | Loads all fixtures (recommended for first-time setup) |
| `users.yml` | Sample user accounts for testing |
| `organizations.yml` | Sample organizations and teams |
| `roles.yml` | User roles and permissions |
| `permissions.yml` | System permissions |
| `role_permissions.yml` | Role-permission mappings |
| `feature_flags.yml` | Feature flag configurations |
| `organization_users.yml` | User-organization relationships |

<Badge type="info">Pro Tip</Badge> The `complete.yml` file uses import statements to load all individual files, making it easy to get a full development environment set up quickly.

## Running the Backend

<Badge type="success">Ready to Start</Badge> Now that your environment is set up, you can start developing!

### Start the Development Server

```bash
air
```

This command starts the backend server with hot reloading enabled. The server will automatically restart when you make changes to your code.

### Verify the Setup

Once the server is running, you can verify everything is working by visiting:

- **Health Check**: [`http://localhost:8080/api/v1/health`](http://localhost:8080/api/v1/health)
- **Swagger UI**: [`http://localhost:8080/swagger/index.html`](http://localhost:8080/swagger/index.html) - Interactive API documentation powered by Fuego
- **OpenAPI Spec**: [`http://localhost:8080/swagger/openapi.json`](http://localhost:8080/swagger/openapi.json) - Raw OpenAPI specification file

<Badge type="tip">Development Tips</Badge>
- The server runs on port `8080` by default
- Database migrations run automatically on startup
- Hot reloading means you don't need to restart the server for most changes
- Check the terminal output for any error messages

## Next Steps

Now that your backend is running, you can:

- **Explore the Codebase**: Check out the [Project Structure](#project-structure) section below
- **Start the Frontend**: Follow the [Frontend Development Guide](../frontend/frontend.md)
- **Write Your First Feature**: See the [Adding a New Feature](#adding-a-new-feature) section
- **Run Tests**: Learn about [Testing](#testing) your code