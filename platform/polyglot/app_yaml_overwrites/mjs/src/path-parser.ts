/**
 * Path Parser Module for app-yaml-overwrites package.
 * Provides dot and bracket notation parsing for nested configuration access.
 */

import { create as createLogger, type ILogger } from './logger.js';

// Create module-level logger
const logger = createLogger('app-yaml-overwrites', 'path-parser.ts');

/**
 * Represents a segment of a parsed path.
 * - key: String key for object access (e.g., "name" in "user.name")
 * - index: Numeric index for array access (e.g., 0 in "items[0]")
 */
export interface PathSegment {
    key?: string;
    index?: number;
}

/**
 * Check if a segment is an index access.
 */
export function isIndexSegment(segment: PathSegment): segment is PathSegment & { index: number } {
    return segment.index !== undefined;
}

/**
 * Get the value of a segment (key or index).
 */
export function getSegmentValue(segment: PathSegment): string | number {
    return segment.index !== undefined ? segment.index : segment.key!;
}

/**
 * PathParser class for parsing dot and bracket notation paths.
 *
 * Supported patterns:
 * - app.name -> ["app", "name"]
 * - providers[0].api_key -> ["providers", 0, "api_key"]
 * - headers["x-custom"] -> ["headers", "x-custom"]
 */
export class PathParser {
    private logger: ILogger;

    // Pattern to match bracket access: [0], ["key"], ['key']
    private static readonly BRACKET_PATTERN = /^\[(\d+|"[^"]*"|'[^']*')\]/;

    constructor(loggerInstance?: ILogger) {
        this.logger = loggerInstance || logger;
    }

    /**
     * Parse a path string into a list of PathSegments.
     *
     * @param path - The path string to parse (e.g., "app.name", "items[0].value")
     * @returns Array of PathSegment objects representing the path
     */
    parse(path: string): PathSegment[] {
        if (!path) {
            this.logger.debug('Empty path provided');
            return [];
        }

        const trimmedPath = path.trim();
        if (trimmedPath !== path) {
            this.logger.warn('Path has leading/trailing whitespace', { path });
        }

        this.logger.debug(`Parsing path: ${trimmedPath}`);

        const segments: PathSegment[] = [];
        let remaining = trimmedPath;

        while (remaining) {
            // Check for bracket notation at the start
            if (remaining.startsWith('[')) {
                const match = PathParser.BRACKET_PATTERN.exec(remaining);
                if (match) {
                    const bracketContent = match[1];

                    // Parse bracket content
                    if (/^\d+$/.test(bracketContent)) {
                        // Numeric index
                        segments.push({ index: parseInt(bracketContent, 10) });
                    } else if (bracketContent.startsWith('"') || bracketContent.startsWith("'")) {
                        // String key in quotes
                        const key = bracketContent.slice(1, -1); // Remove quotes
                        segments.push({ key });
                    } else {
                        segments.push({ key: bracketContent });
                    }

                    remaining = remaining.slice(match[0].length);
                    // Skip following dot if present
                    if (remaining.startsWith('.')) {
                        remaining = remaining.slice(1);
                    }
                } else {
                    // Malformed bracket
                    this.logger.warn(`Malformed bracket notation in path: ${remaining}`);
                    break;
                }
            } else {
                // Find next separator (dot or bracket)
                const dotPos = remaining.indexOf('.');
                const bracketPos = remaining.indexOf('[');

                let endPos: number;
                if (dotPos === -1 && bracketPos === -1) {
                    // No more separators, rest is a key
                    if (remaining) {
                        segments.push({ key: remaining });
                    }
                    break;
                } else if (dotPos === -1) {
                    endPos = bracketPos;
                } else if (bracketPos === -1) {
                    endPos = dotPos;
                } else {
                    endPos = Math.min(dotPos, bracketPos);
                }

                // Extract key up to separator
                const key = remaining.slice(0, endPos);
                if (key) {
                    segments.push({ key });
                }

                // Move past the separator
                if (endPos < remaining.length && remaining[endPos] === '.') {
                    remaining = remaining.slice(endPos + 1);
                } else {
                    remaining = remaining.slice(endPos);
                }
            }
        }

        this.logger.debug(`Parsed ${segments.length} segments from path: ${path}`);
        return segments;
    }

    /**
     * Traverse an object using parsed path segments.
     *
     * @param obj - The object to traverse
     * @param segments - Array of PathSegment objects
     * @param defaultValue - Default value if path not found
     * @returns The value at the path, or default if not found
     */
    traverse(obj: any, segments: PathSegment[], defaultValue?: any): any {
        if (!segments.length) {
            return obj;
        }

        let current = obj;
        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];

            if (current === null || current === undefined) {
                this.logger.debug(`Null/undefined value encountered at segment ${i}`);
                return defaultValue;
            }

            try {
                if (isIndexSegment(segment)) {
                    // Array access
                    if (Array.isArray(current)) {
                        if (segment.index >= 0 && segment.index < current.length) {
                            current = current[segment.index];
                        } else {
                            this.logger.debug(`Index ${segment.index} out of bounds`);
                            return defaultValue;
                        }
                    } else {
                        this.logger.debug(`Cannot index into non-array: ${typeof current}`);
                        return defaultValue;
                    }
                } else {
                    // Object access
                    if (typeof current === 'object' && segment.key! in current) {
                        current = current[segment.key!];
                    } else {
                        this.logger.debug(`Key '${segment.key}' not found`);
                        return defaultValue;
                    }
                }
            } catch (e: any) {
                this.logger.debug(`Access error at segment ${i}: ${e.message}`);
                return defaultValue;
            }
        }

        return current;
    }
}

/**
 * Convenience function to parse a path string.
 *
 * @param path - The path string to parse
 * @returns Array of PathSegment objects
 */
export function parsePath(path: string): PathSegment[] {
    const parser = new PathParser();
    return parser.parse(path);
}

/**
 * Convenience function to traverse an object by path string.
 *
 * @param obj - The object to traverse
 * @param path - The path string (e.g., "app.name", "items[0].value")
 * @param defaultValue - Default value if path not found
 * @returns The value at the path, or default if not found
 */
export function traversePath(obj: any, path: string, defaultValue?: any): any {
    const parser = new PathParser();
    const segments = parser.parse(path);
    return parser.traverse(obj, segments, defaultValue);
}
