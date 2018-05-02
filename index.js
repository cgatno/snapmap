/**
 * Returns a Promise that can be used to delay function execution.
 * @param {number} duration Amount of time, in milliseconds, to delay function execution.
 * @returns {Promise} Promise that resolves after specified duration.
 */
const sleep = duration =>
  new Promise(resolve => setTimeout(resolve, Number(duration)));

// Extends native ES6 Map object
class SnapMap extends Map {
  constructor(...args) {
    // Pass any and all arguments to parent constructor
    super(...args);

    // Use another Map to track timestamps. This will effectively clamp expired values in case their timer
    // tick is delayed due to event loop inconsistencies. This also allows tracking of key updates for aborting
    // deletes on updated keys.
    this.timestamps = new Map();
  }

  /**
   * Add or update a key/value pair.
   * @param {*} key
   * @param {*} value
   * @param {number} [ttl] The duration, in milliseconds, after which the key/value pair will be deleted.
   * @returns {SnapMap} The SnapMap object.
   */
  set(key, value, ttl) {
    // Calculate future timestamp now
    const timestamp = Date.now() + ttl || 0;

    if (typeof ttl !== "undefined") {
      // Set/update timestamp
      this.timestamps.set(key, timestamp);
      // TTL specified, schedule deletion
      (async (key, delay, timestamp) => {
        await sleep(delay);
        if (this.timestamps.get(key) !== timestamp) {
          return;
        }
        this.timestamps.delete(key);
        super.delete(key);

        // Call event hook with deleted key when deletion occurs
        if (typeof this.onDelete === "function") {
          this.onDelete(key);
        }
      })(key, ttl, timestamp);
    } else {
      // No ttl defined - make sure timestamps excludes this key
      this.timestamps.delete(key);
    }

    return super.set(key, value); // mimics default Map API
  }

  /**
   * Retrieve value for a given key.
   * @param {*} key
   */
  get(key) {
    // If there is a timestamp for this value and it has passed, "clamp" deletion by returning undefined
    if (this.timestamps.has(key) && this.timestamps.get(key) < Date.now()) {
      return undefined;
    }

    // Otherwise, return normal Map get
    return super.get(key);
  }

  /**
   * Check if parent map has a given key.
   * @param {*} key
   */
  has(key) {
    // Also do a "clamping" deletion check here
    if (this.timestamps.has(key) && this.timestamps.get(key) < Date.now()) {
      return false;
    }

    return super.has(key);
  }
}

module.exports = SnapMap;
