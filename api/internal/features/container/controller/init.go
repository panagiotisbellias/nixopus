package controller

import (
	"context"
	"fmt"
	"strings"

	"github.com/raghavyuva/nixopus-api/internal/features/deploy/docker"
	"github.com/raghavyuva/nixopus-api/internal/features/logger"
	"github.com/raghavyuva/nixopus-api/internal/features/notification"
	shared_storage "github.com/raghavyuva/nixopus-api/internal/storage"
	shared_types "github.com/raghavyuva/nixopus-api/internal/types"
)

type ContainerController struct {
	store        *shared_storage.Store
	ctx          context.Context
	logger       logger.Logger
	notification *notification.NotificationManager
}

func NewContainerController(
	store *shared_storage.Store,
	ctx context.Context,
	l logger.Logger,
	notificationManager *notification.NotificationManager,
) *ContainerController {
	return &ContainerController{
		store:        store,
		ctx:          ctx,
		logger:       l,
		notification: notificationManager,
	}
}

// getDockerService creates a Docker service based on the request context
// If a server is in the context, it will use SSH tunnel, otherwise local connection
func (c *ContainerController) getDockerService(ctx context.Context) (*docker.DockerService, error) {
	dockerService, err := docker.NewDockerServiceWithContext(ctx)
	if err != nil {
		c.logger.Log(logger.Error, "Failed to create Docker service with context", err.Error())
		return docker.NewDockerService(), nil
	}
	return dockerService, nil
}

func (c *ContainerController) isProtectedContainer(ctx context.Context, containerID string, action string) (*shared_types.Response, bool) {
	dockerService, err := c.getDockerService(ctx)
	if err != nil {
		return nil, false
	}
	defer dockerService.Close()

	details, err := dockerService.GetContainerById(containerID)
	if err != nil {
		return nil, false
	}
	name := strings.ToLower(details.Name)
	if strings.Contains(name, "nixopus") {
		c.logger.Log(logger.Info, fmt.Sprintf("Skipping %s for protected container", action), details.Name)
		return &shared_types.Response{
			Status:  "success",
			Message: "Operation skipped for protected container",
			Data:    map[string]string{"status": "skipped"},
		}, true
	}
	return nil, false
}
