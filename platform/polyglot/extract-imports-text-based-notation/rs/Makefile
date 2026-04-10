.PHONY: build test lint format clean install

install:
	cargo fetch

build:
	cargo build

test:
	cargo test

lint:
	cargo clippy -- -D warnings

format:
	cargo fmt

clean:
	cargo clean
