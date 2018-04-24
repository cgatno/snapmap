class SnapMap extends Map {
  constructor(...args) {
    super(...args);

    // Keep track of expiring keys in order of expiration, ascending expiration times
    // I.e. this.expiringKeys[0] expires first
    this.expiringKeys = [];

    // For efficiency, use only one timer to remove expiring keys
    this.expirationTimer = null;
  }

  set(key, value, expiresIn) {
    // If map already has key, remove from expiring list
    if (this.has(key)) {
      const expiryIndex = this.expiringKeys.findIndex(
        entry => entry.key === key
      );
      // Splice out old record
      this.expiringKeys.splice(expiryIndex, 1);
      // If it was the next item to be removed, reset timer
      if (expiryIndex && expiryIndex === 0) {
        this._removeNextExpiringKey();
      }
    }

    // Set the key/value pair on the base Map
    super.set(key, value);

    if (expiresIn) {
      // Expiration time specified, add an expiration record
      this.expiringKeys.push({
        key: key,
        expiresAt: Date.now() + expiresIn
      });

      // Imperative that expiration records be sorted by expiration time
      // TODO: Improve this algorithm! We should be able to insert a new record with O(log n) complexity
      this.expiringKeys.sort((a, b) => a.expiresAt - b.expiresAt);

      // If expiration timer isn't set, make it start ticking
      if (!this.expirationTimer) {
        this.expirationTimer = setTimeout(
          () => this._removeNextExpiringKey(),
          expiresIn
        );
      }
    }
  }

  _removeNextExpiringKey() {
    // Clear out expiration timer
    clearTimeout(this.expirationTimer);
    this.expirationTimer = null;

    if (this.expiringKeys.length > 0) {
      // If more than one expiring key, schedule timer for next deletion
      if (this.expiringKeys.length > 1) {
        this.expirationTimer = setTimeout(
          () => this._removeNextExpiringKey(),
          this.expiringKeys[1].expiresAt - Date.now()
        );
      }

      // Remove expired key
      return this.delete(this.expiringKeys.shift().key);
    }
    return false;
  }
}

module.exports = SnapMap;
