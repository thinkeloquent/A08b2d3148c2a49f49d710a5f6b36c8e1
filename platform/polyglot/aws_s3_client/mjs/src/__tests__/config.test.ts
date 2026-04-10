/**
 * Unit tests for SDKConfig.
 *
 * Tests cover:
 * - Statement coverage for all code paths
 * - Branch coverage for all conditionals
 * - Environment variable loading
 * - Validation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import {
  type SDKConfig,
  configFromEnv,
  validateConfig,
  assertValidConfig,
} from "../config.js";
import { JsonS3StorageConfigError } from "../errors.js";

describe("SDKConfig", () => {
  // =====================================================================
  // Statement Coverage
  // =====================================================================

  describe("Statement Coverage", () => {
    it("should create config object with bucket name", () => {
      const config: SDKConfig = {
        bucketName: "test-bucket",
        region: "us-east-1",
      };

      expect(config.bucketName).toBe("test-bucket");
    });

    it("should create config with all options", () => {
      const config: SDKConfig = {
        bucketName: "test-bucket",
        region: "us-west-2",
        keyPrefix: "custom:",
        ttl: 7200,
        debug: true,
        hashKeys: ["id", "name"],
        awsAccessKeyId: "AKIATEST",
        awsSecretAccessKey: "********",
        endpointUrl: "http://localhost:4566",
      };

      expect(config.bucketName).toBe("test-bucket");
      expect(config.region).toBe("us-west-2");
      expect(config.keyPrefix).toBe("custom:");
      expect(config.ttl).toBe(7200);
      expect(config.debug).toBe(true);
      expect(config.hashKeys).toEqual(["id", "name"]);
      expect(config.awsAccessKeyId).toBe("AKIATEST");
      expect(config.awsSecretAccessKey).toBe("********");
      expect(config.endpointUrl).toBe("http://localhost:4566");
    });
  });
});

describe("configFromEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // =====================================================================
  // Statement Coverage
  // =====================================================================

  describe("Statement Coverage", () => {
    it("should load config from environment variables", () => {
      process.env.AWS_S3_BUCKET = "env-bucket";
      process.env.AWS_REGION = "eu-west-1";
      process.env.AWS_S3_KEY_PREFIX = "env:";
      process.env.AWS_S3_TTL = "1800";
      process.env.AWS_S3_DEBUG = "true";

      const config = configFromEnv();

      expect(config.bucketName).toBe("env-bucket");
      expect(config.region).toBe("eu-west-1");
      expect(config.keyPrefix).toBe("env:");
      expect(config.ttl).toBe(1800);
      expect(config.debug).toBe(true);
    });
  });

  // =====================================================================
  // Branch Coverage
  // =====================================================================

  describe("Branch Coverage", () => {
    it("should return config with empty bucket when env not set", () => {
      delete process.env.AWS_S3_BUCKET;

      const config = configFromEnv();

      // configFromEnv returns config with empty bucket, validation will catch it
      expect(config.bucketName).toBe("");
    });

    it("should use default region when not set", () => {
      process.env.AWS_S3_BUCKET = "env-bucket";
      delete process.env.AWS_REGION;
      delete process.env.AWS_DEFAULT_REGION;

      const config = configFromEnv();

      expect(config.bucketName).toBe("env-bucket");
      expect(config.region).toBe("us-east-1");
      expect(config.keyPrefix).toBe("jss3:");
    });

    it("should handle debug=false", () => {
      process.env.AWS_S3_BUCKET = "env-bucket";
      process.env.AWS_S3_DEBUG = "false";

      const config = configFromEnv();

      expect(config.debug).toBe(false);
    });

    it("should handle TTL undefined", () => {
      process.env.AWS_S3_BUCKET = "env-bucket";
      delete process.env.AWS_S3_TTL;

      const config = configFromEnv();

      expect(config.ttl).toBeUndefined();
    });

    it("should load AWS credentials from env", () => {
      process.env.AWS_S3_BUCKET = "env-bucket";
      process.env.AWS_ACCESS_KEY_ID = "AKIATEST";
      process.env.AWS_SECRET_ACCESS_KEY = "********";

      const config = configFromEnv();

      expect(config.awsAccessKeyId).toBe("AKIATEST");
      expect(config.awsSecretAccessKey).toBe("********");
    });
  });
});

describe("validateConfig", () => {
  // =====================================================================
  // Branch Coverage
  // =====================================================================

  describe("Branch Coverage", () => {
    it("should return empty array for valid config", () => {
      const config: SDKConfig = {
        bucketName: "test-bucket",
        region: "us-east-1",
      };

      const issues = validateConfig(config);

      expect(issues).toEqual([]);
    });

    it("should return issues for empty bucket name", () => {
      const config: SDKConfig = { bucketName: "", region: "us-east-1" };

      const issues = validateConfig(config);

      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some((e) => e.toLowerCase().includes("bucketname"))).toBe(
        true,
      );
    });

    it("should return issues for missing region", () => {
      const config: SDKConfig = { bucketName: "test-bucket" };

      const issues = validateConfig(config);

      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some((e) => e.toLowerCase().includes("region"))).toBe(true);
    });

    it("should return issues for negative TTL", () => {
      const config: SDKConfig = {
        bucketName: "test-bucket",
        region: "us-east-1",
        ttl: -100,
      };

      const issues = validateConfig(config);

      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some((e) => e.toLowerCase().includes("ttl"))).toBe(true);
    });
  });
});

describe("assertValidConfig", () => {
  // =====================================================================
  // Statement Coverage
  // =====================================================================

  describe("Statement Coverage", () => {
    it("should not throw for valid config", () => {
      const config: SDKConfig = {
        bucketName: "test-bucket",
        region: "us-east-1",
      };

      expect(() => assertValidConfig(config)).not.toThrow();
    });
  });

  // =====================================================================
  // Error Handling
  // =====================================================================

  describe("Error Handling", () => {
    it("should throw ConfigError for invalid config", () => {
      const config: SDKConfig = { bucketName: "" };

      expect(() => assertValidConfig(config)).toThrow(JsonS3StorageConfigError);
    });

    it("should include error message in exception", () => {
      const config: SDKConfig = { bucketName: "" };

      expect(() => assertValidConfig(config)).toThrow("bucketName is required");
    });
  });
});
