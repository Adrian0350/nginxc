/*!
* nginxc
* Copyright(c) 2017 Carlos Ascari Gutierrez Hermosillo
* MIT Licensed
*/

'use strict';

/**
* Nginx Configuration
*
* Toolset for creating `nginx.conf` files.
* @module nginxc
*/

/*!
* Module dependencies.
*/

const fs = require('fs');

/**
* Character used when indenting.
* @private
* @const
* @type {String}
*/
const INDENT_CHARACTER = ' ';

/**
* Number of `INDENT_CHARACTER` characters per depth level.
* @private
* @const
* @type {String}
*/
const INDENT_MULTIPLIER = 2;

/**
* @private
* @method depthToWhitespace
* @param {Number} [d=0] Clause depth.
* @return {String}
*/
const depthToWhitespace = (d = 0) => new Array(d * INDENT_MULTIPLIER).fill(INDENT_CHARACTER).join('');

/**
* Directive class.
* @private
*/
class Directive {

  /**
  * Create a Directive.
  * @param {String} name Name of Directive.
  * @param {String} value Value of Directive.
  */
  constructor(name, value) {
    Object.defineProperty(this, '__DIRECTIVE__', {
      value: { name, value }
    });
  }

  /**
  * Name of Directive.
  * @readonly
  * @type {String}
  */
  get name() { return this.__DIRECTIVE__.name; }

  /**
  * Value of Directive.
  * @readonly
  * @type {String}
  */
  get value() { return this.__DIRECTIVE__.value; }

  /**
  * To nginx config formatted string.
  * @readonly
  * @type {String}
  */
  toString() { return `${this.name} ${this.value};`; }
}

/**
* Clause class.
* @private
*/
class Clause {

  /**
  * Create a Clause.
  * @param {String} name Name of Clause.
  * @param {Number} [depth=0] Nesting depth of Clause. 0 is for a root Clause.
  */
  constructor(name, depth=0) {
    Object.defineProperty(this, '__CLAUSE__', {
      value: { name, depth, entries: [] }
    });
  }

  /**
  * Name of Clause.
  * @readonly
  * @type {String}
  */
  get name() { return this.__CLAUSE__.name; }

  /**
  * Nested depth of Clause.
  * @readonly
  * @type {Number}
  */
  get depth() { return this.__CLAUSE__.depth; }

  /**
  * Appends a new Clause as a child of this Clause.
  * @param {String} name Name of new Clause
  * @param {Function} callback
  * @return {Clause} Returns `this` instance. **Chainable**.
  */
  clause(name, callback) {
    const clause = new Clause(name, this.depth + 1);
    callback(clause);
    this.__CLAUSE__.entries.push(clause);
    return this;
  }

  /**
  * Appends a new Directive.
  * @param {String} name Name of Directive.
  * @param {String} value Value of Directive.
  * @return {Clause} Returns `this` instance. **Chainable**.
  */
  directive(name, value) {
    this.__CLAUSE__.entries.push(new Directive(name, value));
    return this;
  }

  /**
  * Appends a new Location directive.
  * @param {String} path Pathname of Location.
  * @param {Function} callback
  * @return {Clause} Returns `this` instance. **Chainable**.
  */
  location(path, callback) {
    const clause = new Location(path, this.depth + 1);
    callback(clause);
    this.__CLAUSE__.entries.push(clause);
    return this;
  }

  /**
  * Alias for **clause** method.
  * @param {String} name Name of new Clause
  * @param {Function} callback
  * @return {Clause} Returns `this` instance. **Chainable**.
  */
  cl(name, callback) { return this.clause(name, callback); }

  /**
  * Alias for **directive** method.
  * @param {String} name Name of new Clause
  * @param {Function} callback
  * @return {Clause} Returns `this` instance. **Chainable**.
  */
  dir(name, value) { return this.directive(name, value); }

  /**
  * Alias for **location** method.
  * @param {String} name Name of new Clause
  * @param {Function} callback
  * @return {Clause} Returns `this` instance. **Chainable**.
  */
  loc(path, callback) { return this.location(path, callback); }

  /**
  * To nginx config formatted string.
  * @readonly
  * @type {String}
  */
  toString() {
    const result = [];
    const ws = depthToWhitespace(this.depth);
    const entries = this.__CLAUSE__.entries;
    const spacer = this.depth <= 1 ? '\n' : '';
    entries.forEach(entry => {
      if (entry instanceof Directive) {
        result.push(`${ws}${entry.toString()}`);
      } else if (entry instanceof Clause) {
        result.push(`${spacer}${ws}${ entry.name } {\n${ entry.toString() }\n${ws}}`);
      } else if (entry instanceof Location) {
        result.push(`${spacer}${ws}${ entry.name } {\n${ entry.toString() }\n${ws}}`);
      } else {
        throw new Error('Fatal.');
      }
    });
    return result.join('\n');
  }
}

/**
* Location class.
* @private
* @extends {Clause}
*/
class Location extends Clause {

  /**
  * Create a Location.
  * @param {String} path Pathname of Location.
  * @param {Number} [depth=0] Nesting depth of Clause. 0 is for a root Clause.
  */
  constructor(path, depth=0) {
    super(`location ${ path }`, depth);
    Object.defineProperty(this, '__LOCATION__', {
      value: { path }
    });
    delete this.location; // Disallow creating location clauses.
  }

  /**
  * To nginx config formatted string.
  * @readonly
  * @type {String}
  */
  toString() {
    const result = [];
    const ws = depthToWhitespace(this.depth);
    const entries = this.__CLAUSE__.entries;
    entries.forEach(entry => {
      if (entry instanceof Directive) {
        result.push(`${ws}${entry.toString()}`);
      } else if (entry instanceof Clause) {
        result.push(`${ws}${ entry.name } {\n${ entry.toString() }\n${ws}}`);
      } else if (entry instanceof Location) {
        result.push(`${ws}${ entry.name } {\n${ entry.toString() }\n${ws}}`);
      } else {
        throw new Error('Fatal.');
      }
    });
    return result.join('\n');
  }
}

/**
* NginxConfig class.
* @extends {Clause}
*/
class NginxConfig extends Clause {

  /**
  * Create a NginxConfig.
  * @param {String} filename
  * @param {Number} [depth=0] Nesting depth of Clause. 0 is for a root Clause.
  */
  constructor(filename) {
    super('root');
    Object.defineProperty(this, '__NGINX_CONFIG__', {
      value: { filename }
    });
  }
}

const createInstance = () => {
  return new NginxConfig();
};

module.exports = createInstance;