APP_NAME := indoeropa
CLIENT_DIR := client
SERVER_DIR := server

.PHONY: help install run build preview start server dev clean lint format

install:
	cd $(CLIENT_DIR) && npm install

run:
	cd $(CLIENT_DIR) && npm run start

build:
	cd $(CLIENT_DIR) && npm run build

preview:
	cd $(CLIENT_DIR) && npm run preview

start:
	cd $(CLIENT_DIR) && npm start

server:
	cd $(SERVER_DIR) && npx nodemon server.js

lint:
	cd $(CLIENT_DIR) && npm run lint || true

format:
	cd $(CLIENT_DIR) && npx prettier --write .

clean:
	cd $(CLIENT_DIR) && rm -rf node_modules build dist
	cd $(SERVER_DIR) && rm -rf node_modules

help:
	@echo ""
	@echo "Available commands:"
	@echo "  make install   - Install client dependencies"
	@echo "  make run       - Run frontend (CRA)"
	@echo "  make server    - Run backend server"
	@echo "  make build     - Build frontend"
	@echo "  make clean     - Remove node_modules & builds"
	@echo ""