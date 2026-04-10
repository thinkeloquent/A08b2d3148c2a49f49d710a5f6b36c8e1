/**
 * Logger spy utilities for test verification.
 */
export function createLoggerSpy() {
    const logs = { trace: [], debug: [], info: [], warn: [], error: [] };
    const mockLogger = {
        trace: (msg, data) => logs.trace.push({ msg, data }),
        debug: (msg, data) => logs.debug.push({ msg, data }),
        info: (msg, data) => logs.info.push({ msg, data }),
        warn: (msg, data) => logs.warn.push({ msg, data }),
        error: (msg, data, err) => logs.error.push({ msg, data, err }),
    };
    return { logs, mockLogger };
}

export function expectLogContains(logs, level, text) {
    const found = logs[level].some(entry => entry.msg && entry.msg.includes(text));
    expect(found).toBe(true);
}
