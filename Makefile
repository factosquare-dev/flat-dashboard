# Dashboard Makefile
.DEFAULT_GOAL := help

# Variables
ENV ?= dev
NODE_ENV ?= development

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m

# Icons
CHECK := ✅
ROCKET := 🚀

help: ## Show help
	@echo "$(BLUE)FLAT Dashboard Commands$(NC)"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

# Development
dev: ## Start dashboard
	@echo "$(BLUE)$(ROCKET) Starting dashboard...$(NC)"
	@docker-compose up -d dashboard
	@echo "$(GREEN)$(CHECK) Dashboard: http://localhost:5173$(NC)"

stop: ## Stop dashboard
	@docker-compose stop dashboard

down: ## Stop and remove dashboard
	@docker-compose down

logs: ## View logs
	@docker-compose logs -f dashboard

shell: ## Open dashboard shell
	@docker-compose exec dashboard /bin/sh

# Build
build: ## Build dashboard image
	@echo "$(BLUE)Building dashboard...$(NC)"
	@docker-compose build dashboard

# Utilities
clean: ## Clean up Docker resources
	@docker-compose down -v
	@docker image prune -f

.PHONY: help dev stop down logs shell build clean