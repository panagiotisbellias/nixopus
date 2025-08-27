package controller

import (
	"net/http"

	"github.com/docker/docker/api/types/container"
	"github.com/go-fuego/fuego"
	"github.com/raghavyuva/nixopus-api/internal/features/logger"
	shared_types "github.com/raghavyuva/nixopus-api/internal/types"
)

func (c *ContainerController) RestartContainer(f fuego.ContextNoBody) (*shared_types.Response, error) {
	containerID := f.PathParam("container_id")

	dockerService, err := c.getDockerService(f.Context())
	if err != nil {
		return nil, fuego.HTTPError{
			Err:    err,
			Status: http.StatusInternalServerError,
		}
	}
	defer dockerService.Close()

	err = dockerService.RestartContainer(containerID, container.StopOptions{})
	if err != nil {
		c.logger.Log(logger.Error, err.Error(), "")
		return nil, fuego.HTTPError{
			Err:    err,
			Status: http.StatusInternalServerError,
		}
	}

	return &shared_types.Response{
		Status:  "success",
		Message: "Container restarted successfully",
		Data:    map[string]string{"status": "restarted"},
	}, nil
}
