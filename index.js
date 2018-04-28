/**
 * Returns a Promise that can be used to delay function execution.
 * @param {number} duration Amount of time, in milliseconds, to delay function execution.
 * @returns {Promise} Promise that resolves after specified duration.
 */
const sleep = duration => new Promise(resolve => setTimeout(resolve, duration));

// Extends native ES6 Map object
class SnapMap extends Map {
  constructor(...args) {
    // Pass any and all arguments to parent constructor
    super(...args);

    // Use another Map to track key updates. This allows scheduled deletes to abort if their key
    // has been updated after the original scheduling.
    // Necessary to use Map here to support any key type
    this.updatedKeys = new Map();
  }

  /**
   * Add or update a key/value pair.
   * @param {*} key
   * @param {*} value
   * @param {number} [ttl] The duration, in milliseconds, after which the key/value pair will be deleted.
   * @returns {SnapMap} The SnapMap object.
   */
  set(key, value, ttl) {
    // If key already exists, this is an update. Make sure scheduled deletion is aborted.
    if (super.has(key)) {
      this.updatedKeys.set(key, true);
    }

    // Store new data in parent Map
    super.set(key, value);

    if (ttl) {
      // TTL specified, schedule deletion
      this._deleteKey(key, ttl);
    }

    return this; // mimics default Map API
  }

  async _deleteKey(key, delay) {
    await sleep(delay);
    if (this.updatedKeys.has(key)) {
      this.updatedKeys.delete(key);
      return;
    }
    super.delete(key);
  }
}

module.exports = SnapMap;
