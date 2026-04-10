.PHONY: build test lint format clean install

install:
	go mod download

build:
	go build ./...

test:
	go test ./... -v

lint:
	golangci-lint run ./...

format:
	gofmt -w .

clean:
	go clean
