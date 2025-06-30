# Contributing to Nixopus Backend

This guide provides detailed instructions for contributing to the Nixopus backend codebase.

## Setup for Backend Development

1. **Prerequisites**
   - Go version 1.23.6 or newer
   - PostgreSQL
   - Docker and Docker Compose (recommended)

2. **Environment Setup**

   ```bash
   # Clone the repository
   git clone https://github.com/raghavyuva/nixopus.git
   cd nixopus
   
   # Set up PostgreSQL database
   createdb nixopus -U postgres
   createdb nixopus_test -U postgres
   
   # Copy environment template
   # Note: Be sure to update the environment variables to suit your setup.
   cp api/.env.sample api/.env
   
   # Install dependencies
   cd api
   go mod download
   ```

3. **Database Migrations**

Currently **the migration works automatically when starting the server**. However, you can run migrations manually using the following command:

   ```bash
   # Run migrations
   cd api
   go run migrations/main.go
   ```

4. **Loading Development Fixtures**

The project includes a comprehensive fixtures system for development and testing. You can load sample data using the following commands:

   ```bash
   cd api
   
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
   - `fixtures/development/complete.yml` - Loads all fixtures (uses imports)
   - `fixtures/development/users.yml` - User data only
   - `fixtures/development/organizations.yml` - Organization data only
   - `fixtures/development/roles.yml` - Role data only
   - `fixtures/development/permissions.yml` - Permission data only
   - `fixtures/development/role_permissions.yml` - Role-permission mappings
   - `fixtures/development/feature_flags.yml` - Feature flags
   - `fixtures/development/organization_users.yml` - User-organization relationships

   The `complete.yml` file uses import statements to load all individual files, making it easy to get a full development environment set up quickly.

*Note: [air](https://github.com/air-verse/air) as a dev-dependency so you can start the backend with the air command.*


## Testing

1. **Run Unit Tests**

   ```bash
   cd api
   go test ./internal/features/your-feature/...
   ```

2. **Run Integration Tests**

   ```bash
   cd api
   go test ./api/internal/tests/... -tags=integration
   ```

3. **Run All Tests**

   ```bash
   cd api
   make test
   ```

## Optimizing Performance

1. **Use Database Indices** for frequently queried columns
2. **Implement Caching** for expensive operations
3. **Optimize SQL Queries** for better performance
4. **Add Proper Error Handling** and logging

## Code Style and Guidelines

1. Follow Go's [Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments)
2. Use meaningful variable and function names
3. Add comments for complex logic
4. Structure code for readability and maintainability
5. Follow the existing project patterns

## Common Pitfalls

1. Forgetting to update migrations
2. Not handling database transactions properly
3. Missing error handling
4. Inadequate test coverage
5. Not considering performance implications

## Submitting Your Contribution

1. **Commit Changes**

   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

2. **Push and Create a Pull Request**

   ```bash
   git push origin feature/your-feature-name
   ```

3. Follow the PR template and provide detailed information about your changes.

## Need Help?

If you need assistance, feel free to:

- Create an issue on GitHub
- Reach out on the project's Discord channel
- Contact the maintainers directly

Thank you for contributing to Nixopus!
