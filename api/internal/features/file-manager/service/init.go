package service

import (
	"context"

	"github.com/melbahja/goph"
	"github.com/raghavyuva/nixopus-api/internal/features/logger"
	"github.com/raghavyuva/nixopus-api/internal/features/ssh"
)

type FileManagerService struct {
	logger logger.Logger
}

func NewFileManagerService(ctx context.Context, logger logger.Logger) *FileManagerService {
	return &FileManagerService{
		logger: logger,
	}
}

// getSSHClient creates SSH connection based on request context
func (s *FileManagerService) getSSHClient(ctx context.Context) (*goph.Client, error) {
	sshClient := ssh.NewSSHWithContext(ctx)
	return sshClient.Connect()
}
