package views

import (
	"context"
	"strings"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	appStorage "github.com/raghavyuva/nixopus-api/internal/storage"
)

type MainView struct {
	store     *appStorage.Store
	ctx       context.Context
	width     int
	height    int
	activeTab int
	tabs      []string
}

func NewMainView(store *appStorage.Store, ctx context.Context) *MainView {
	return &MainView{
		store:     store,
		ctx:       ctx,
		tabs:      []string{"Auth", "Organizations", "Deployments", "Settings"},
		activeTab: 0,
	}
}

func (m *MainView) Init() tea.Cmd {
	return nil
}

func (m *MainView) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height
	case tea.KeyMsg:
		switch msg.String() {
		case "left", "h":
			if m.activeTab > 0 {
				m.activeTab--
			}
		case "right", "l":
			if m.activeTab < len(m.tabs)-1 {
				m.activeTab++
			}
		case "q", "ctrl+c":
			return m, tea.Quit
		}
	}
	return m, nil
}

func (m *MainView) View() string {
	doc := strings.Builder{}

	renderedTabs := []string{}
	for i, t := range m.tabs {
		var style lipgloss.Style
		if i == m.activeTab {
			style = lipgloss.NewStyle().Foreground(lipgloss.Color("62")).Bold(true)
		} else {
			style = lipgloss.NewStyle().Foreground(lipgloss.Color("240"))
		}
		renderedTabs = append(renderedTabs, style.Render(t))
	}

	row := lipgloss.JoinHorizontal(
		lipgloss.Top,
		renderedTabs...,
	)

	gap := strings.Repeat(" ", max(0, m.width-lipgloss.Width(row)-2))
	row = lipgloss.JoinHorizontal(lipgloss.Bottom, row, gap)
	doc.WriteString(row + "\n\n")

	var content string
	switch m.activeTab {
	case 0:
		content = "Auth View - Login/Register"
	case 1:
		content = "Organizations View - Manage Organizations"
	case 2:
		content = "Deployments View - Manage Deployments"
	case 3:
		content = "Settings View - Configure Settings"
	}

	border := lipgloss.NewStyle().
		BorderStyle(lipgloss.NormalBorder()).
		BorderForeground(lipgloss.Color("62")).
		Padding(1, 2).
		Width(m.width - 4).
		Height(m.height - 6)

	return border.Render(doc.String() + content)
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
