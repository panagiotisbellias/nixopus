package main

import (
	"context"
	"log"
	"os"
    tea "github.com/charmbracelet/bubbletea"
	"github.com/raghavyuva/nixopus-api/internal/config"
	"github.com/raghavyuva/nixopus-api/internal/storage"
	"github.com/raghavyuva/nixopus-api/internal/tui/views"
	"github.com/raghavyuva/nixopus-api/internal/types"
)

type model struct {
	store    *storage.Store
	ctx      context.Context
	mainView *views.MainView
	authView *views.AuthView
	width    int
	height   int
}

func initialModel(store *storage.Store, ctx context.Context) model {
	return model{
		store:    store,
		ctx:      ctx,
		mainView: views.NewMainView(store, ctx),
		authView: views.NewAuthView(store, ctx),
	}
}

func (m model) Init() tea.Cmd {
	return nil
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height
		m.mainView.Update(msg)
		m.authView.Update(msg)
	case tea.KeyMsg:
		switch msg.String() {
		case "ctrl+c", "q":
			return m, tea.Quit
		}
	}

	// Update the current view based on authentication state
	if m.authView.IsAuthenticated {
		m.mainView.Update(msg)
	} else {
		m.authView.Update(msg)
	}

	return m, nil
}

func (m model) View() string {
	if m.authView.IsAuthenticated {
		return m.mainView.View()
	}
	return m.authView.View()
}

func runTUI() {
	store := config.Init()
	ctx := context.Background()
	_ = storage.NewApp(&types.Config{}, store, ctx)

	p := tea.NewProgram(initialModel(store, ctx), tea.WithAltScreen())
	if _, err := p.Run(); err != nil {
		log.Fatal(err)
		os.Exit(1)
	}
}
