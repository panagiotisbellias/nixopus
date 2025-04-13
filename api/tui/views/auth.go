package views

import (
	"context"
	"strings"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/go-fuego/fuego"
	auth "github.com/raghavyuva/nixopus-api/internal/features/auth/controller"
	authService "github.com/raghavyuva/nixopus-api/internal/features/auth/service"
	authStorage "github.com/raghavyuva/nixopus-api/internal/features/auth/storage"
	auth_types "github.com/raghavyuva/nixopus-api/internal/features/auth/types"
	"github.com/raghavyuva/nixopus-api/internal/features/logger"
	"github.com/raghavyuva/nixopus-api/internal/features/notification"
	orgService "github.com/raghavyuva/nixopus-api/internal/features/organization/service"
	orgStorage "github.com/raghavyuva/nixopus-api/internal/features/organization/storage"
	permService "github.com/raghavyuva/nixopus-api/internal/features/permission/service"
	permStorage "github.com/raghavyuva/nixopus-api/internal/features/permission/storage"
	roleService "github.com/raghavyuva/nixopus-api/internal/features/role/service"
	roleStorage "github.com/raghavyuva/nixopus-api/internal/features/role/storage"
	appStorage "github.com/raghavyuva/nixopus-api/internal/storage"
)

type AuthView struct {
	store           *appStorage.Store
	ctx             context.Context
	width           int
	height          int
	authController  *auth.AuthController
	username        string
	password        string
	showPassword    bool
	errorMessage    string
	IsAuthenticated bool
	isPasswordField bool
	cursor          int
	choices         []string
}

func NewAuthView(store *appStorage.Store, ctx context.Context) *AuthView {
	userStorage := &authStorage.UserStorage{DB: store.DB, Ctx: ctx}
	permStorage := &permStorage.PermissionStorage{DB: store.DB, Ctx: ctx}
	roleStorage := &roleStorage.RoleStorage{DB: store.DB, Ctx: ctx}
	orgStorage := &orgStorage.OrganizationStore{DB: store.DB, Ctx: ctx}

	permService := permService.NewPermissionService(store, ctx, logger.NewLogger(), permStorage)
	roleService := roleService.NewRoleService(store, ctx, logger.NewLogger(), roleStorage)
	orgService := orgService.NewOrganizationService(store, ctx, logger.NewLogger(), orgStorage)

	authService := authService.NewAuthService(userStorage, logger.NewLogger(), permService, roleService, orgService, ctx)
	notificationManager := notification.NewNotificationManager(store.DB)

	return &AuthView{
		store:           store,
		ctx:             ctx,
		authController:  auth.NewAuthController(ctx, logger.NewLogger(), notificationManager, *authService),
		username:        "",
		password:        "",
		showPassword:    false,
		errorMessage:    "",
		IsAuthenticated: false,
		isPasswordField: false,
	}
}

func (a *AuthView) Init() tea.Cmd {
	return nil
}

func (a *AuthView) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "enter":
			if a.username != "" && a.password != "" {
				_, err := a.authController.Login(fuego.NewMockContext(auth_types.LoginRequest{
					Email:    a.username,
					Password: a.password,
				}))
				if err != nil {
					a.errorMessage = err.Error()
					return a, nil
				}
				a.IsAuthenticated = true
				return a, nil
			}
		case "tab":
			a.isPasswordField = !a.isPasswordField
		case "up", "k":
			if a.cursor > 0 {
				a.cursor--
			}
		case "down", "j":
			if a.cursor < len(a.choices)-1 {
				a.cursor++
			}
		case "backspace":
			if a.isPasswordField {
				if len(a.password) > 0 {
					a.password = a.password[:len(a.password)-1]
				}
			} else {
				if len(a.username) > 0 {
					a.username = a.username[:len(a.username)-1]
				}
			}
		default:
			if len(msg.String()) == 1 {
				if a.isPasswordField {
					a.password += msg.String()
				} else {
					a.username += msg.String()
				}
			}
		}
	case tea.WindowSizeMsg:
		a.width = msg.Width
		a.height = msg.Height
	}

	return a, nil
}

func (a *AuthView) View() string {
	doc := strings.Builder{}

	title := lipgloss.NewStyle().
		Foreground(lipgloss.Color("62")).
		Bold(true).
		Render("Nixopus Authentication")
	doc.WriteString(title + "\n\n")

	usernameLabel := lipgloss.NewStyle().
		Render("Username: ")
	usernameInput := lipgloss.NewStyle().
		Foreground(lipgloss.Color("255")).
		Render(a.username)
	if !a.isPasswordField {
		usernameInput = lipgloss.NewStyle().
			Foreground(lipgloss.Color("255")).
			Render(a.username)
	}
	doc.WriteString(usernameLabel + usernameInput + "\n")

	passwordLabel := lipgloss.NewStyle().
		Foreground(lipgloss.Color("240")).
		Render("Password: ")
	passwordInput := lipgloss.NewStyle().
		Foreground(lipgloss.Color("255")).
		Render(strings.Repeat("*", len(a.password)))
	if a.isPasswordField {
		passwordInput = lipgloss.NewStyle().
			Foreground(lipgloss.Color("255")).
			Render(strings.Repeat("*", len(a.password)))
	}
	doc.WriteString(passwordLabel + passwordInput + "\n")

	instructions := lipgloss.NewStyle().
		Foreground(lipgloss.Color("240")).
		Render("\nTab: Switch between username/password\nEnter: Login\nCtrl+C: Quit")
	doc.WriteString(instructions)

	if a.errorMessage != "" {
		errorStyle := lipgloss.NewStyle().
			Foreground(lipgloss.Color("1")).
			Render(a.errorMessage)
		doc.WriteString("\n\n" + errorStyle)
	}

	border := lipgloss.NewStyle().
		BorderStyle(lipgloss.NormalBorder()).
		BorderForeground(lipgloss.Color("62")).
		Padding(1, 2).
		Width(a.width - 4).
		Height(a.height - 4)

	return border.Render(doc.String())
}
