# Backend architecture

## Project Structure

The backend follows a clean architecture approach:

```sh
.
├── Dockerfile            # Dockerfile for building the Docker image
├── Makefile              # commands for building and running the project
├── api                   # API generated client/server stubs from client
├── cmd/fixtures          # Entry point for loading fixtures
├── doc
│   └── openapi.json      # API schema definition / OpenAPI spec
├── env.test              # Environment variables for testing
├── fixtures              # Sample yaml data files for test runs
├── go.mod                # Dependency management for project
├── internal              # Application code / service and core logic
├── main.go               # Application entry point
└── migrations            # SQL scripts for migrations
```

## Adding a New Feature

1. **Create a New Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Implement Your Feature**

   Create a new directory under `api/internal/features/` with the following structure:

   ```
   api/internal/features/your-feature/
   ├── controller/init.go   # HTTP handlers
   ├── service/service_name.go      # Business logic
   ├── storage/dao_name.go      # Data access
   └── types/type_name.go        # Type definitions
   ```

   Here's a sample implementation:

   ```go
   // types.go
   package yourfeature
   
   type YourEntity struct {
       ID        string `json:"id" db:"id"`
       Name      string `json:"name" db:"name"`
       CreatedAt string `json:"created_at" db:"created_at"`
       UpdatedAt string `json:"updated_at" db:"updated_at"`
   }
   
   // init.go (Controller)
   package yourfeature

   import "github.com/go-fuego/fuego"

   type Controller struct {
        service *Service
   }

   func NewController(s *Service)*Controller {
        return &Controller{service: s}
   }

   func (c *Controller) GetEntities(ctx fuego.Context) error {
        entities, err := c.service.ListEntities()
        if err != nil {
            return ctx.JSON(500, map[string]string{"error": err.Error()})
        }
        return ctx.JSON(200, entities)
   }

   func (c *Controller) CreateEntity(ctx fuego.Context) error {
        var input YourEntity
        if err := ctx.Bind(&input); err != nil {
            return ctx.JSON(400, map[string]string{"error": "invalid input"})
        }
        created, err := c.service.CreateEntity(&input)
        if err != nil {
            return ctx.JSON(500, map[string]string{"error": err.Error()})
        }
        return ctx.JSON(201, created)
   }

   // service.go or service_name.go
   package yourfeature

   type Service struct {
       storage *Storage
   }

   func NewService(storage *Storage)*Service {
       return &Service{storage: storage}
   }

   // init.go or storage.go
   package yourfeature

   import (
        "context"
        "github.com/uptrace/bun"
   )

   type Storage struct {
       DB *bun.DB
       Ctx context.Context
   }

   func NewFeatureStorage(db *bun.DB, ctx context.Context)*NewFeatureStorage {
       return &FeatureStorage{
            DB:  db,
            Ctx: ctx
        }
   }

   ```

3. **Register Routes**

   Update `api/internal/routes.go` to include your new endpoints:

   ```go
   // Register your feature routes
   yourFeatureStorage := yourfeature.NewStorage(db)
   yourFeatureService := yourfeature.NewService(yourFeatureStorage)
   yourFeatureController := yourfeature.NewController(yourFeatureService)
   
   api := router.Group("/api")
   {
       // Your feature endpoints
       featureGroup := api.Group("/your-feature")
       {
           featureGroup.GET("/", middleware.Authorize(), yourFeatureController.GetEntities)
           featureGroup.POST("/", middleware.Authorize(), yourFeatureController.CreateEntity)
           // Add more routes as needed
       }
   }
   ```

4. **Add Database Migrations**

   Create migration files in `api/migrations/your-feature/`:

   ```sql
   -- seq_number_create_your_feature_table.up.sql
   CREATE TABLE your_feature (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       name TEXT NOT NULL,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );
   
   -- seq_number_create_your_feature_table.down.sql
   DROP TABLE IF EXISTS your_feature;
   ```

5. **Write Tests**

   Organize your tests in the `tests/` using a separate folder named after each feature:

   ```go
   // controller_test.go
   package yourfeature
   
   import (
       "testing"
       // Import other necessary packages
   )
   
   func TestGetEntity(t *testing.T) {
       // Test implementation
   }
   
   // service_test.go
   // storage_test.go
   ```

6. **Update API Documentation**

   Note that the docs will be updated automatically; the OpenAPI specification in `api/doc/openapi.json` will be updated automatically.
