/**
 * @module utils/cql-builder
 * @description Fluent CQL (Confluence Query Language) query builder.
 *
 * Confluence Data Center uses CQL for searching content, similar to Jira's JQL.
 * This builder provides a safe, composable API for constructing CQL queries
 * without manual string concatenation or escaping concerns.
 *
 * CQL reference: https://developer.atlassian.com/server/confluence/advanced-searching-using-cql/
 *
 * Supported operators:
 * - `=`, `!=` — exact match / not equal
 * - `~`, `!~` — contains / does not contain (full-text)
 * - `in`, `not in` — list membership
 * - `is null`, `is not null` — null checks
 *
 * Logical operators: `AND`, `OR`, `NOT`
 * Ordering: `ORDER BY field ASC|DESC`
 *
 * @example
 * import { cql, CQLBuilder } from './cql-builder.mjs';
 *
 * // Simple query
 * const query = cql('space').equals('DEV').and().field('type').equals('page').build();
 * // => 'space = "DEV" AND type = "page"'
 *
 * // Complex query with ordering
 * const query = new CQLBuilder()
 *   .field('space').equals('DEV')
 *   .and()
 *   .field('type').equals('page')
 *   .and()
 *   .field('label').equals('architecture')
 *   .orderBy('lastModified', 'DESC')
 *   .build();
 * // => 'space = "DEV" AND type = "page" AND label = "architecture" ORDER BY lastModified DESC'
 */

/**
 * Escape a CQL string value by wrapping in double quotes and escaping
 * embedded double quotes and backslashes.
 *
 * @param {string} value - The raw string value to escape.
 * @returns {string} The escaped and quoted string.
 * @private
 */
function _escapeValue(value) {
  const escaped = String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `"${escaped}"`;
}

/**
 * Fluent CQL query builder for Confluence content search.
 *
 * Builds CQL query strings incrementally through a chainable API.
 * Call `.build()` to produce the final query string.
 *
 * @example
 * const builder = new CQLBuilder();
 * const query = builder
 *   .field('space').equals('DEV')
 *   .and()
 *   .field('ancestor').equals('12345')
 *   .orderBy('created', 'ASC')
 *   .build();
 */
export class CQLBuilder {
  constructor() {
    /** @private @type {string[]} */
    this._parts = [];
    /** @private @type {string|null} */
    this._currentField = null;
    /** @private @type {string|null} */
    this._orderByClause = null;
  }

  /**
   * Set the current field for the next condition.
   *
   * @param {string} fieldName - CQL field name (e.g. 'space', 'type', 'label', 'ancestor').
   * @returns {CQLBuilder} This builder instance for chaining.
   *
   * @example
   * builder.field('space').equals('DEV');
   */
  field(fieldName) {
    this._currentField = fieldName;
    return this;
  }

  /**
   * Add an equality condition: `field = "value"`.
   *
   * @param {string} value - The value to match.
   * @returns {CQLBuilder} This builder instance for chaining.
   */
  equals(value) {
    this._assertField('equals');
    this._parts.push(`${this._currentField} = ${_escapeValue(value)}`);
    this._currentField = null;
    return this;
  }

  /**
   * Add a not-equal condition: `field != "value"`.
   *
   * @param {string} value - The value to exclude.
   * @returns {CQLBuilder} This builder instance for chaining.
   */
  notEquals(value) {
    this._assertField('notEquals');
    this._parts.push(`${this._currentField} != ${_escapeValue(value)}`);
    this._currentField = null;
    return this;
  }

  /**
   * Add a contains condition: `field ~ "value"` (full-text search).
   *
   * @param {string} value - The text to search for.
   * @returns {CQLBuilder} This builder instance for chaining.
   */
  contains(value) {
    this._assertField('contains');
    this._parts.push(`${this._currentField} ~ ${_escapeValue(value)}`);
    this._currentField = null;
    return this;
  }

  /**
   * Add a not-contains condition: `field !~ "value"`.
   *
   * @param {string} value - The text to exclude.
   * @returns {CQLBuilder} This builder instance for chaining.
   */
  notContains(value) {
    this._assertField('notContains');
    this._parts.push(`${this._currentField} !~ ${_escapeValue(value)}`);
    this._currentField = null;
    return this;
  }

  /**
   * Add an IN condition: `field in ("a", "b", "c")`.
   *
   * @param {string[]} values - The list of values to match.
   * @returns {CQLBuilder} This builder instance for chaining.
   */
  inList(values) {
    this._assertField('inList');
    const escaped = values.map(_escapeValue).join(', ');
    this._parts.push(`${this._currentField} in (${escaped})`);
    this._currentField = null;
    return this;
  }

  /**
   * Add a NOT IN condition: `field not in ("a", "b", "c")`.
   *
   * @param {string[]} values - The list of values to exclude.
   * @returns {CQLBuilder} This builder instance for chaining.
   */
  notInList(values) {
    this._assertField('notInList');
    const escaped = values.map(_escapeValue).join(', ');
    this._parts.push(`${this._currentField} not in (${escaped})`);
    this._currentField = null;
    return this;
  }

  /**
   * Add an IS NOT NULL condition: `field is not null`.
   *
   * @returns {CQLBuilder} This builder instance for chaining.
   */
  isNotNull() {
    this._assertField('isNotNull');
    this._parts.push(`${this._currentField} is not null`);
    this._currentField = null;
    return this;
  }

  /**
   * Add an IS NULL condition: `field is null`.
   *
   * @returns {CQLBuilder} This builder instance for chaining.
   */
  isNull() {
    this._assertField('isNull');
    this._parts.push(`${this._currentField} is null`);
    this._currentField = null;
    return this;
  }

  /**
   * Add an AND logical operator between conditions.
   *
   * @returns {CQLBuilder} This builder instance for chaining.
   */
  and() {
    this._parts.push('AND');
    return this;
  }

  /**
   * Add an OR logical operator between conditions.
   *
   * @returns {CQLBuilder} This builder instance for chaining.
   */
  or() {
    this._parts.push('OR');
    return this;
  }

  /**
   * Add a NOT logical operator (prefix for the next condition).
   *
   * @returns {CQLBuilder} This builder instance for chaining.
   */
  not() {
    this._parts.push('NOT');
    return this;
  }

  /**
   * Set the ORDER BY clause. Replaces any previously set ordering.
   *
   * @param {string} fieldName - Field to order by (e.g. 'created', 'lastModified', 'title').
   * @param {'ASC'|'DESC'} [direction='ASC'] - Sort direction.
   * @returns {CQLBuilder} This builder instance for chaining.
   *
   * @example
   * builder.field('type').equals('page').orderBy('lastModified', 'DESC').build();
   * // => 'type = "page" ORDER BY lastModified DESC'
   */
  orderBy(fieldName, direction = 'ASC') {
    const dir = direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    this._orderByClause = `ORDER BY ${fieldName} ${dir}`;
    return this;
  }

  /**
   * Build the final CQL query string.
   *
   * Joins all accumulated parts with spaces and appends the ORDER BY clause
   * if one was specified.
   *
   * @returns {string} The complete CQL query string.
   * @throws {Error} If no conditions have been added.
   *
   * @example
   * const query = new CQLBuilder()
   *   .field('space').equals('DEV')
   *   .and()
   *   .field('type').equals('page')
   *   .build();
   * // => 'space = "DEV" AND type = "page"'
   */
  build() {
    if (this._parts.length === 0) {
      throw new Error('CQL query is empty — add at least one condition before building');
    }

    let query = this._parts.join(' ');
    if (this._orderByClause) {
      query += ` ${this._orderByClause}`;
    }
    return query;
  }

  /**
   * Assert that a current field has been set before applying an operator.
   *
   * @param {string} operatorName - Name of the operator being applied (for error messages).
   * @throws {Error} If no field has been set via `.field()`.
   * @private
   */
  _assertField(operatorName) {
    if (!this._currentField) {
      throw new Error(
        `CQLBuilder: call .field(name) before .${operatorName}()`,
      );
    }
  }
}

/**
 * Shortcut factory: create a CQLBuilder and set the first field in one call.
 *
 * @param {string} fieldName - The initial field name.
 * @returns {CQLBuilder} A new CQLBuilder with the field already set.
 *
 * @example
 * const query = cql('space').equals('DEV')
 *   .and()
 *   .field('type').equals('page')
 *   .build();
 * // => 'space = "DEV" AND type = "page"'
 */
export function cql(fieldName) {
  return new CQLBuilder().field(fieldName);
}
