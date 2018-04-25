class Node {
  constructor(data, left = null, right = null) {
    this.data = data;
    this.left = left;
    this.right = right;
  }
}

class BST {
  constructor() {
    this.root = null;
  }

  insert(data) {
    const node = new Node(data);
    if (this.root === null) {
      this.root = node;
    } else {
      let current = this.root;
      let parent;
      while (true) {
        parent = current;
        if (data < current.data) {
          current = current.left;
          if (current === null) {
            parent.left = node;
            break;
          }
        } else {
          current = current.right;
          if (current === null) {
            parent.right = node;
            break;
          }
        }
      }
    }
  }

  getMin() {
    let current = this.root;
    if (!current) {
      return null;
    }
    while (current.left !== null) {
      current = current.left;
    }
    return current;
  }

  remove(data) {
    const removeNode = function(node, data) {
      if (!node) {
        return null;
      }
      if (data === node.data) {
        if (!node.left && !node.right) {
          return null;
        }
        if (!node.left) {
          return node.right;
        }
        if (!node.right) {
          return node.left;
        }
        // 2 children
        const temp = that.getMin(node.right);
        node.data = temp;
        node.right = removeNode(node.right, temp);
        return node;
      } else if (data < node.data) {
        node.left = removeNode(node.left, data);
        return node;
      } else {
        node.right = removeNode(node.right, data);
        return node;
      }
    };
    this.root = removeNode(this.root, data);
  }
}

class SnapMap extends Map {
  constructor(...args) {
    // Pass any and all args to parent constructor
    super(...args);

    // Keep track of expiration times in binary search tree
    // O(log n) accession and insertion
    this.expiringKeys = new BST();

    // Also use a plain object to keep track of all keys expiring at a given time
    this.expirationTimeToKey = {};

    // And finally, keep track of keys to expiration times for data updates
    this.keyToExpirationTime = {};

    // For efficiency, use only one timer to remove expiring keys
    this.expirationTimer = null;
  }

  // expiresIn: Time period in milliseconds after which the entry is automatically erased.
  set(key, value, expiresIn) {
    // Determine if this is an update
    const update = super.has(key);

    // Store new pair in parent Map
    super.set(key, value);

    if (update) {
      // Remove key from old expiration time entry
      const oldTime = this.keyToExpirationTime[key];
      const index = this.expirationTimeToKey[oldTime].indexOf(key);
      this.expirationTimeToKey[oldTime].splice(index, 1);
    }

    // Immediately store desired expiration time
    const expirationTime = expiresIn && Date.now() + expiresIn;

    if (expirationTime) {
      // Stop running timers
      this._stopExpirationTimer();

      if (this.expirationTimeToKey[expirationTime]) {
        // Expiration time already registered for other keys, add new key
        this.expirationTimeToKey[expirationTime].push(key);
      } else {
        // New expiration time in map
        this.expirationTimeToKey[expirationTime] = [key];
        // Also add expiration time to BST
        this.expiringKeys.insert(expirationTime);
      }

      this.keyToExpirationTime[key] = expirationTime;

      // Restart timer
      this._startExpirationTimer();
    }
  }

  _stopExpirationTimer() {
    if (this.expirationTimer !== null) {
      // Clear out expiration timer
      clearTimeout(this.expirationTimer);
      this.expirationTimer = null;
    }
  }

  _startExpirationTimer(nextExpiration) {
    // Clear if timer is currently running
    this._stopExpirationTimer();

    // Attempt to get next expiration record
    const next = nextExpiration || this.expiringKeys.getMin();
    if (next) {
      // Set up a new timeout to run when next expiration time reached
      this.expirationTimer = setTimeout(
        () => this._expirationTimerTick(next.data),
        next.data - Date.now()
      );
    }
  }

  _expirationTimerTick(expiringTime) {
    // Stop currently running timer
    this._stopExpirationTimer();

    // Get next expiration and remove from parent Map
    const expired = expiringTime || this.expiringKeys.getMin().data;
    if (expired) {
      if (this.expirationTimeToKey[expired].length > 1) {
        this.expirationTimeToKey[expired].forEach(key => {
          this.delete(key);
          delete this.keyToExpirationTime[key];
        });
      } else if (this.expirationTimeToKey[expired].length === 1) {
        const key = this.expirationTimeToKey[expired][0];
        this.delete(key);
        delete this.keyToExpirationTime[key];
      }
    }

    this.expiringKeys.remove(expired);
    delete this.expirationTimeToKey[expired];

    let next = this.expiringKeys.getMin();
    if (next) {
      this._startExpirationTimer(next.data);
    }
  }
}

module.exports = SnapMap;
