
import { describe, it, expect } from 'vitest';
import { ImmutabilityError } from '../src/errors.js';

describe('ImmutabilityError', () => {
    it('should be an instance of Error', () => {
        const err = new ImmutabilityError();
        expect(err).toBeInstanceOf(Error);
        expect(err).toBeInstanceOf(ImmutabilityError);
    });

    it('should have correct check message', () => {
        const err = new ImmutabilityError();
        expect(err.message).toBe("Configuration is immutable");
    });
});
