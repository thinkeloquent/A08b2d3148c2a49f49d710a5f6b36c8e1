/**
 * Tests for input validation functions.
 */

import { describe, it, expect } from 'vitest';
import {
  validateRepositoryName,
  validateUsername,
  validateBranchName,
  RESERVED_REPO_NAMES,
} from '../../src/sdk/validation.mjs';
import { ValidationError } from '../../src/sdk/errors.mjs';

describe('validateRepositoryName', () => {
  it('should accept valid repository names', () => {
    expect(() => validateRepositoryName('my-repo')).not.toThrow();
    expect(() => validateRepositoryName('my_repo')).not.toThrow();
    expect(() => validateRepositoryName('MyRepo123')).not.toThrow();
    expect(() => validateRepositoryName('a')).not.toThrow();
    expect(() => validateRepositoryName('repo.js')).not.toThrow();
  });

  it('should reject empty/null names', () => {
    expect(() => validateRepositoryName('')).toThrow(ValidationError);
    expect(() => validateRepositoryName(null)).toThrow(ValidationError);
    expect(() => validateRepositoryName(undefined)).toThrow(ValidationError);
  });

  it('should reject names longer than 100 characters', () => {
    const longName = 'a'.repeat(101);
    expect(() => validateRepositoryName(longName)).toThrow(ValidationError);
    expect(() => validateRepositoryName(longName)).toThrow('at most 100');
  });

  it('should reject names starting or ending with dot', () => {
    expect(() => validateRepositoryName('.hidden')).toThrow(ValidationError);
    expect(() => validateRepositoryName('repo.')).toThrow(ValidationError);
  });

  it('should reject names with special characters', () => {
    expect(() => validateRepositoryName('repo name')).toThrow(ValidationError);
    expect(() => validateRepositoryName('repo@name')).toThrow(ValidationError);
    expect(() => validateRepositoryName('repo/name')).toThrow(ValidationError);
    expect(() => validateRepositoryName('repo!name')).toThrow(ValidationError);
  });

  it('should reject reserved names', () => {
    expect(() => validateRepositoryName('settings')).toThrow(ValidationError);
    expect(() => validateRepositoryName('Settings')).toThrow(ValidationError);
    expect(() => validateRepositoryName('SETTINGS')).toThrow(ValidationError);
    expect(() => validateRepositoryName('security')).toThrow(ValidationError);
    expect(() => validateRepositoryName('pulls')).toThrow(ValidationError);
    expect(() => validateRepositoryName('issues')).toThrow(ValidationError);
    expect(() => validateRepositoryName('actions')).toThrow(ValidationError);
  });

  it('should have at least 50 reserved names', () => {
    expect(RESERVED_REPO_NAMES.size).toBeGreaterThanOrEqual(50);
  });

  it('should accept names that look like reserved but are different', () => {
    expect(() => validateRepositoryName('my-settings')).not.toThrow();
    expect(() => validateRepositoryName('issues-tracker')).not.toThrow();
  });
});

describe('validateUsername', () => {
  it('should accept valid usernames', () => {
    expect(() => validateUsername('octocat')).not.toThrow();
    expect(() => validateUsername('user-name')).not.toThrow();
    expect(() => validateUsername('User123')).not.toThrow();
    expect(() => validateUsername('a')).not.toThrow();
  });

  it('should reject empty/null usernames', () => {
    expect(() => validateUsername('')).toThrow(ValidationError);
    expect(() => validateUsername(null)).toThrow(ValidationError);
    expect(() => validateUsername(undefined)).toThrow(ValidationError);
  });

  it('should reject usernames longer than 39 characters', () => {
    const longName = 'a'.repeat(40);
    expect(() => validateUsername(longName)).toThrow(ValidationError);
    expect(() => validateUsername(longName)).toThrow('at most 39');
  });

  it('should reject usernames starting or ending with hyphen', () => {
    expect(() => validateUsername('-user')).toThrow(ValidationError);
    expect(() => validateUsername('user-')).toThrow(ValidationError);
  });

  it('should reject usernames with consecutive hyphens', () => {
    expect(() => validateUsername('user--name')).toThrow(ValidationError);
    expect(() => validateUsername('user--name')).toThrow('consecutive hyphens');
  });

  it('should reject usernames with special characters', () => {
    expect(() => validateUsername('user.name')).toThrow(ValidationError);
    expect(() => validateUsername('user_name')).toThrow(ValidationError);
    expect(() => validateUsername('user name')).toThrow(ValidationError);
    expect(() => validateUsername('user@name')).toThrow(ValidationError);
  });

  it('should accept single-character usernames', () => {
    expect(() => validateUsername('x')).not.toThrow();
    expect(() => validateUsername('1')).not.toThrow();
  });
});

describe('validateBranchName', () => {
  it('should accept valid branch names', () => {
    expect(() => validateBranchName('main')).not.toThrow();
    expect(() => validateBranchName('feature/my-feature')).not.toThrow();
    expect(() => validateBranchName('release/v1.0.0')).not.toThrow();
    expect(() => validateBranchName('hotfix-123')).not.toThrow();
    expect(() => validateBranchName('user/feature')).not.toThrow();
  });

  it('should reject empty/null branch names', () => {
    expect(() => validateBranchName('')).toThrow(ValidationError);
    expect(() => validateBranchName(null)).toThrow(ValidationError);
    expect(() => validateBranchName(undefined)).toThrow(ValidationError);
  });

  it('should reject branch names longer than 255 characters', () => {
    const longName = 'a'.repeat(256);
    expect(() => validateBranchName(longName)).toThrow(ValidationError);
  });

  it('should reject branch names with consecutive slashes', () => {
    expect(() => validateBranchName('feature//name')).toThrow(ValidationError);
    expect(() => validateBranchName('feature//name')).toThrow(
      'consecutive slashes',
    );
  });

  it('should reject single "@" as branch name', () => {
    expect(() => validateBranchName('@')).toThrow(ValidationError);
  });

  it('should reject branch names with forbidden characters', () => {
    expect(() => validateBranchName('branch name')).toThrow(ValidationError);
    expect(() => validateBranchName('branch~name')).toThrow(ValidationError);
    expect(() => validateBranchName('branch^name')).toThrow(ValidationError);
    expect(() => validateBranchName('branch:name')).toThrow(ValidationError);
    expect(() => validateBranchName('branch?name')).toThrow(ValidationError);
    expect(() => validateBranchName('branch*name')).toThrow(ValidationError);
    expect(() => validateBranchName('branch[name')).toThrow(ValidationError);
    expect(() => validateBranchName('branch\\name')).toThrow(ValidationError);
  });

  it('should reject branch names ending with .lock', () => {
    expect(() => validateBranchName('branch.lock')).toThrow(ValidationError);
  });

  it('should reject branch names starting or ending with dot', () => {
    expect(() => validateBranchName('.hidden')).toThrow(ValidationError);
    expect(() => validateBranchName('branch.')).toThrow(ValidationError);
  });

  it('should reject branch names with consecutive dots', () => {
    expect(() => validateBranchName('branch..name')).toThrow(ValidationError);
  });

  it('should accept branch names with @ in them (not standalone)', () => {
    expect(() => validateBranchName('user@feature')).not.toThrow();
  });

  it('should reject branch names with control characters', () => {
    expect(() => validateBranchName('branch\x00name')).toThrow(
      ValidationError,
    );
    expect(() => validateBranchName('branch\tname')).toThrow(ValidationError);
  });
});
