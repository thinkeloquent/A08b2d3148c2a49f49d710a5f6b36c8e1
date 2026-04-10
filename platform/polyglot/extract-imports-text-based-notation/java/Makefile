.PHONY: build test lint format clean install

install:
	mvn dependency:resolve -q

build:
	mvn compile -q

test:
	mvn test -q

lint:
	mvn checkstyle:check -q 2>/dev/null || true

format:
	mvn fmt:format -q 2>/dev/null || true

clean:
	mvn clean -q
