package service

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/raghavyuva/nixopus-api/internal/features/logger"
	"github.com/raghavyuva/nixopus-api/internal/features/servers/types"
	"github.com/raghavyuva/nixopus-api/internal/features/servers/validation"
	shared_types "github.com/raghavyuva/nixopus-api/internal/types"
)

// CreateServer creates a new server in the application.
//
// It takes a CreateServerRequest, which contains the server details, and a user ID.
// The user ID is used to associate the server with a user.
//
// It returns a CreateServerResponse containing the server ID, and an error.
// The error is either ErrServerAlreadyExists, or any error that occurred
// while creating the server in the storage layer.
func (s *ServersService) CreateServer(req types.CreateServerRequest, userID string) (types.CreateServerResponse, error) {
	s.logger.Log(logger.Info, "create server request received", fmt.Sprintf("server_name=%s, host=%s, user_id=%s", req.Name, req.Host, userID))

	_, err := uuid.Parse(userID)
	if err != nil {
		s.logger.Log(logger.Error, "invalid user id", fmt.Sprintf("user_id=%s", userID))
		return types.CreateServerResponse{}, types.ErrInvalidUserID
	}

	if userID == "" {
		s.logger.Log(logger.Error, "invalid user id", fmt.Sprintf("user_id=%s", userID))
		return types.CreateServerResponse{}, types.ErrInvalidUserID
	}

	validator := validation.NewValidator(s.storage)
	if err := validator.ValidateCreateServerRequest(req); err != nil {
		return types.CreateServerResponse{}, err
	}

	org, err := s.store.Organization.GetOrganization(req.OrganizationID.String())
	if err != nil {
		s.logger.Log(logger.Error, "error while retrieving organization", err.Error())
		return types.CreateServerResponse{}, fmt.Errorf("organization not found")
	}
	if org == nil || org.ID == uuid.Nil {
		s.logger.Log(logger.Error, "organization not found", req.OrganizationID.String())
		return types.CreateServerResponse{}, fmt.Errorf("organization not found")
	}

	tx, err := s.storage.BeginTx()
	if err != nil {
		s.logger.Log(logger.Error, "failed to start transaction", err.Error())
		return types.CreateServerResponse{}, types.ErrFailedToCreateServer
	}
	defer tx.Rollback()

	txStorage := s.storage.WithTx(tx)

	// Check for existing server by name
	existingServerByName, err := txStorage.GetServerName(req.Name, req.OrganizationID)
	if err != nil {
		s.logger.Log(logger.Debug, "error while checking existing server by name", err.Error())
	}

	if existingServerByName != nil {
		s.logger.Log(logger.Error, "server already exists", fmt.Sprintf("server_name=%s", req.Name))
		return types.CreateServerResponse{}, types.ErrServerAlreadyExists
	}

	// Check for existing server by host and port
	existingServerByHost, err := txStorage.GetServerByHost(req.Host, req.Port, req.OrganizationID)
	if err != nil {
		s.logger.Log(logger.Debug, "error while checking existing server by host", err.Error())
	}

	if existingServerByHost != nil {
		s.logger.Log(logger.Error, "server with host already exists", fmt.Sprintf("host=%s, port=%d", req.Host, req.Port))
		return types.CreateServerResponse{}, types.ErrServerHostAlreadyExists
	}

	server := &shared_types.Server{
		ID:                uuid.New(),
		Name:              req.Name,
		Description:       req.Description,
		Host:              req.Host,
		Port:              req.Port,
		Username:          req.Username,
		SSHPassword:       req.SSHPassword,
		SSHPrivateKeyPath: req.SSHPrivateKeyPath,
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
		DeletedAt:         nil,
		UserID:            uuid.MustParse(userID),
		OrganizationID:    req.OrganizationID,
	}

	if err := txStorage.CreateServer(server); err != nil {
		s.logger.Log(logger.Error, "error while creating server", err.Error())
		return types.CreateServerResponse{}, err
	}

	if err := tx.Commit(); err != nil {
		s.logger.Log(logger.Error, "failed to commit transaction", err.Error())
		return types.CreateServerResponse{}, types.ErrFailedToCreateServer
	}

	return types.CreateServerResponse{ID: server.ID.String()}, nil
}
