APP_NAME := dion-transport

.PHONY: help install run build preview start clean lint format

install:
	npm install

run:
	npm run start

build:
	npm run build

preview:
	npm run preview

start:
	npm start

lint:
	npm run lint || true

format:
	npx prettier --write .

clean:
	rm -rf node_modules
	rm -rf dist
	rm -rf build

help:
	@echo ""
	@echo "Available commands:"
	@echo "  make install   - Install dependencies"
	@echo "  make dev       - Run development server"
	@echo "  make build     - Build for production"
	@echo "  make preview   - Preview production build (Vite)"
	@echo "  make start     - Start production build (CRA)"
	@echo "  make lint      - Run linter"
	@echo "  make format    - Run prettier"
	@echo "  make clean     - Remove node_modules & build"
	@echo ""
