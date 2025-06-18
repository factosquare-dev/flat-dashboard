up:
	docker-compose up -d

down:
	docker-compose down -v --remove-orphans

clean:
	docker-compose down --rmi all -v --remove-orphans

help:
	@echo "Available targets:"
	@echo "  up     - Start the docker-compose services in detached mode"
	@echo "  down   - Stop the docker-compose services"
	@echo "  clean  - Stop and remove containers, images, volumes, and orphans"
	@echo "  help   - Show this help message"

.PHONY: up down clean help