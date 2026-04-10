/**
 * Security Validation Module for app-yaml-overwrites package.
 * Provides path validation to prevent prototype pollution and code injection attacks.
 */

import { SecurityError, ErrorCode } from './errors.js';
import { create as createLogger, type ILogger } from './logger.js';

// Create module-level logger
const logger = createLogger('app-yaml-overwrites', 'security.ts');

/**
 * Security validation for template paths.
 *
 * Validates paths against:
 * - Blocked patterns (__proto__, constructor, etc.)
 * - Underscore-prefixed segments
 * - Path traversal (..)
 * - Valid path format (starts with letter, alphanumeric/underscore/dot only)
 */
export class Security {
    // Allowed: start with alpha, then alpha/num/underscore/dot
    private static readonly PATH_PATTERN = /^[a-zA-Z][a-zA-Z0-9_.]*$/;

    // Dangerous patterns that could lead to prototype pollution or code injection
    private static readonly BLOCKED_PATTERNS = new Set([
        '__proto__',
        '__class__',
        '__dict__',
        'constructor',
        'prototype'
    ]);

    /**
     * Validate a path against security rules.
     *
     * @param path - The path string to validate
     * @throws SecurityError if the path fails validation
     */
    public static validatePath(path: string): void {
        logger.debug(`Validating path: ${path}`);

        if (!path) {
            logger.warn('Empty path provided');
            throw new SecurityError(
                'Path cannot be empty',
                ErrorCode.SECURITY_BLOCKED_PATH
            );
        }

        // Check basic format
        if (!Security.PATH_PATTERN.test(path)) {
            logger.warn(`Invalid path format: ${path}`);
            throw new SecurityError(
                `Invalid path: ${path}. Must start with letter and contain only alphanumeric, underscore, or dot.`,
                ErrorCode.SECURITY_BLOCKED_PATH,
                { path }
            );
        }

        // Check for path traversal
        if (path.includes('..')) {
            logger.warn(`Path traversal attempt: ${path}`);
            throw new SecurityError(
                'Path traversal not allowed (..)',
                ErrorCode.SECURITY_BLOCKED_PATH,
                { path }
            );
        }

        // Check each segment
        const segments = path.split('.');
        for (const segment of segments) {
            // Check for blocked patterns
            if (Security.BLOCKED_PATTERNS.has(segment)) {
                logger.warn(`Blocked pattern detected: ${segment} in ${path}`);
                throw new SecurityError(
                    `Path contains blocked segment: ${segment}`,
                    ErrorCode.SECURITY_BLOCKED_PATH,
                    { path, segment }
                );
            }

            // Check for underscore prefix (private access)
            if (segment.startsWith('_')) {
                logger.warn(`Underscore prefix detected: ${segment} in ${path}`);
                throw new SecurityError(
                    `Path segment starts with underscore: ${segment}`,
                    ErrorCode.SECURITY_BLOCKED_PATH,
                    { path, segment }
                );
            }
        }

        logger.debug(`Path validation passed: ${path}`);
    }

    /**
     * Check if a path is safe without raising an exception.
     *
     * @param path - The path string to check
     * @returns True if the path is safe, False otherwise
     */
    public static isSafePath(path: string): boolean {
        try {
            Security.validatePath(path);
            return true;
        } catch {
            return false;
        }
    }
}

/**
 * Convenience function to validate a path.
 *
 * @param path - The path string to validate
 * @throws SecurityError if the path fails validation
 */
export function validatePath(path: string): void {
    Security.validatePath(path);
}

/**
 * Convenience function to check if a path is safe.
 *
 * @param path - The path string to check
 * @returns True if the path is safe, False otherwise
 */
export function isSafePath(path: string): boolean {
    return Security.isSafePath(path);
}
