/**
 * Tests for logger module.
 */

import { describe, it, expect, vi } from "vitest";
import { Writable } from "stream";
import { create, DefaultLogger, NullLogger, LogLevel } from "../logger.js";

describe("Logger", () => {
  it("create returns DefaultLogger instance", () => {
    const logger = create("test_package", import.meta.url);
    expect(logger).toBeInstanceOf(DefaultLogger);
  });

  it("logger output has correct format", () => {
    let output = "";
    const mockStream = new Writable({
      write(chunk, _encoding, callback) {
        output += chunk.toString();
        callback();
      },
    }) as NodeJS.WriteStream;

    const logger = create("test_package", import.meta.url, {
      stream: mockStream,
    });

    logger.info("Test message");

    expect(output).toContain("[INFO]");
    expect(output).toContain("[test_package:");
    expect(output).toContain("Test message");
  });

  it("all log levels work", () => {
    let output = "";
    const mockStream = new Writable({
      write(chunk, _encoding, callback) {
        output += chunk.toString();
        callback();
      },
    }) as NodeJS.WriteStream;

    const logger = create("test_package", import.meta.url, {
      stream: mockStream,
    });

    logger.debug("Debug message");
    logger.info("Info message");
    logger.warn("Warn message");
    logger.error("Error message");

    expect(output).toContain("[DEBUG]");
    expect(output).toContain("[INFO]");
    expect(output).toContain("[WARN]");
    expect(output).toContain("[ERROR]");
  });

  it("respects level filtering", () => {
    let output = "";
    const mockStream = new Writable({
      write(chunk, _encoding, callback) {
        output += chunk.toString();
        callback();
      },
    }) as NodeJS.WriteStream;

    const logger = create("test_package", import.meta.url, {
      level: LogLevel.WARN,
      stream: mockStream,
    });

    logger.debug("Debug message");
    logger.info("Info message");
    logger.warn("Warn message");
    logger.error("Error message");

    expect(output).not.toContain("Debug message");
    expect(output).not.toContain("Info message");
    expect(output).toContain("Warn message");
    expect(output).toContain("Error message");
  });
});

describe("NullLogger", () => {
  it("does nothing", () => {
    const logger = new NullLogger();

    // These should not throw
    expect(() => logger.debug("Debug")).not.toThrow();
    expect(() => logger.info("Info")).not.toThrow();
    expect(() => logger.warn("Warn")).not.toThrow();
    expect(() => logger.error("Error")).not.toThrow();
  });
});
