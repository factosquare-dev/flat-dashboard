# Dashboard Makefile
.PHONY: help dev build clean logs shell

# Default environment
ENV ?= dev
NODE_ENV ?= development

# Version management
VERSION := $(shell ../scripts/get-version.sh $(ENV))
IMAGE_NAME := flat_dashboard
FULL_IMAGE_NAME := $(IMAGE_NAME):$(VERSION)

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)FLAT Dashboard Commands:$(NC)"
	@awk 'BEGIN {FS = ":.*##"; printf "\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

# Development commands
dev: ## Start development server
	@echo "$(BLUE)🚀 Starting dashboard development server...$(NC)"
	docker-compose up -d dashboard

up: dev ## Alias for dev

down: ## Stop dashboard
	@echo "$(RED)🛑 Stopping dashboard...$(NC)"
	docker-compose down

restart: down dev ## Restart dashboard

# Build commands with cleanup
build: ## Build dashboard image
	@echo "$(BLUE)🔨 Building dashboard image...$(NC)"
	@docker rmi flat_dashboard_$(ENV) 2>/dev/null || true
	@docker image prune -f
	docker-compose build dashboard

build-clean: ## Clean build (remove and rebuild)
	@echo "$(RED)🧹 Removing existing dashboard image...$(NC)"
	@docker rmi flat_dashboard_$(ENV) 2>/dev/null || true
	@docker image prune -f
	@echo "$(BLUE)🔨 Building fresh dashboard image...$(NC)"
	docker-compose build --no-cache dashboard

# Utility commands
logs: ## View dashboard logs
	@echo "$(BLUE)📋 Dashboard logs...$(NC)"
	docker-compose logs -f dashboard

shell: ## Open dashboard shell
	@echo "$(BLUE)🐚 Opening dashboard shell...$(NC)"
	docker-compose exec dashboard /bin/sh

# Clean up
clean: ## Deep clean (remove images and volumes)
	@echo "$(RED)🧹 Deep cleaning...$(NC)"
	docker-compose down -v --remove-orphans
	@docker rmi flat_dashboard_dev flat_dashboard_prod 2>/dev/null || true
	@docker image prune -f

docker-clean: ## Clean up Docker resources
	@echo "$(RED)🐋 Cleaning up Docker resources...$(NC)"
	docker image prune -f
	@echo "$(GREEN)✨ Docker cleanup complete!$(NC)"

# Additional commands from original file preserved below
help:
	@echo "Available targets:"
	@echo "  up     - Start the docker-compose services in detached mode"
	@echo "  down   - Stop the docker-compose services"
	@echo "  clean  - Stop and remove containers, images, volumes, and orphans"
	@echo "  help   - Show this help message"

.PHONY: up down clean help