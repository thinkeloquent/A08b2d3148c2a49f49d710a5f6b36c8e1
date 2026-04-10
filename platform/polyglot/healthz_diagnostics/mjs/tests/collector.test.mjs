/**
 * Unit tests for healthz-diagnostics collector module.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DiagnosticsCollector } from '../src/collector.mjs';
import { createMockTime } from './helpers/test-utils.mjs';


describe('DiagnosticsCollector', () => {
    let mockTime;

    beforeEach(() => {
        mockTime = createMockTime(0);
    });

    afterEach(() => {
        mockTime.restore();
    });

    describe('StatementCoverage', () => {

        it('pushStart() records request:start event', () => {
            const collector = new DiagnosticsCollector();

            collector.pushStart('https://api.example.com/health', 'GET');

            const events = collector.getEvents();
            expect(events.length).toBe(1);
            expect(events[0].type).toBe('request:start');
        });

        it('pushEnd() records request:end event', () => {
            const collector = new DiagnosticsCollector();
            collector.pushStart('https://api.example.com/health', 'GET');
            mockTime.advance(150);

            collector.pushEnd(200);

            const events = collector.getEvents();
            expect(events.length).toBe(2);
            expect(events[1].type).toBe('request:end');
        });

        it('pushError() records request:error event', () => {
            const collector = new DiagnosticsCollector();
            collector.pushStart('https://api.example.com/health', 'GET');
            mockTime.advance(50);

            collector.pushError('Connection refused');

            const events = collector.getEvents();
            expect(events.length).toBe(2);
            expect(events[1].type).toBe('request:error');
        });

        it('getDuration() returns total duration in seconds', () => {
            const collector = new DiagnosticsCollector();
            collector.pushStart('https://api.example.com/health', 'GET');
            mockTime.advance(250);
            collector.pushEnd(200);

            const duration = collector.getDuration();

            expect(duration).toBeCloseTo(0.25, 2);
        });
    });

    describe('BranchCoverage', () => {

        it('success path: start -> end', () => {
            const collector = new DiagnosticsCollector();

            collector.pushStart('https://api.example.com/health', 'GET');
            mockTime.advance(100);
            collector.pushEnd(200);

            const events = collector.getEvents();
            expect(events[0].type).toBe('request:start');
            expect(events[1].type).toBe('request:end');
        });

        it('error path: start -> error', () => {
            const collector = new DiagnosticsCollector();

            collector.pushStart('https://api.example.com/health', 'GET');
            mockTime.advance(50);
            collector.pushError('Timeout');

            const events = collector.getEvents();
            expect(events[0].type).toBe('request:start');
            expect(events[1].type).toBe('request:error');
        });

        it('pushError with Error object extracts message', () => {
            const collector = new DiagnosticsCollector();
            collector.pushStart('https://api.example.com/health', 'GET');

            collector.pushError(new Error('Connection failed'));

            const events = collector.getEvents();
            expect(events[1].error).toBe('Connection failed');
        });
    });

    describe('BoundaryValues', () => {

        it('empty collector returns empty events', () => {
            const collector = new DiagnosticsCollector();

            const events = collector.getEvents();

            expect(events).toEqual([]);
        });

        it('multiple start/end pairs', () => {
            const collector = new DiagnosticsCollector();

            collector.pushStart('https://api1.example.com', 'GET');
            mockTime.advance(100);
            collector.pushEnd(200);

            collector.pushStart('https://api2.example.com', 'POST');
            mockTime.advance(200);
            collector.pushEnd(201);

            const events = collector.getEvents();
            expect(events.length).toBe(4);
        });

        it('getDuration() before any events returns 0', () => {
            const collector = new DiagnosticsCollector();

            const duration = collector.getDuration();

            expect(duration).toBe(0.0);
        });
    });

    describe('EventStructure', () => {

        it('start event has required fields', () => {
            const collector = new DiagnosticsCollector();

            collector.pushStart('https://api.example.com/health', 'GET');

            const events = collector.getEvents();
            const event = events[0];
            expect(event).toHaveProperty('type');
            expect(event).toHaveProperty('timestamp');
            expect(event.type).toBe('request:start');
            expect(event).toHaveProperty('metadata');
            expect(event.metadata.url).toBe('https://api.example.com/health');
            expect(event.metadata.method).toBe('GET');
        });

        it('end event has required fields', () => {
            const collector = new DiagnosticsCollector();
            collector.pushStart('https://api.example.com/health', 'GET');
            mockTime.advance(100);

            collector.pushEnd(200);

            const events = collector.getEvents();
            const event = events[1];
            expect(event).toHaveProperty('type');
            expect(event).toHaveProperty('timestamp');
            expect(event).toHaveProperty('status');
            expect(event.status).toBe(200);
        });

        it('error event has required fields', () => {
            const collector = new DiagnosticsCollector();
            collector.pushStart('https://api.example.com/health', 'GET');
            mockTime.advance(50);

            collector.pushError('Connection failed');

            const events = collector.getEvents();
            const event = events[1];
            expect(event).toHaveProperty('type');
            expect(event).toHaveProperty('timestamp');
            expect(event).toHaveProperty('error');
            expect(event.error).toBe('Connection failed');
        });

        it('default method is GET', () => {
            const collector = new DiagnosticsCollector();

            collector.pushStart('https://api.example.com/health');

            const events = collector.getEvents();
            expect(events[0].metadata.method).toBe('GET');
        });
    });
});
