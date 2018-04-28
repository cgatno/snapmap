class ExpMinHeap {
  constructor() {
    this.heap = [];
    this.entryMap = {};
    this.keyToTimeMap = {};
  }

  // Insertion `element` has the form
  //  {
  //    value: number,
  //    keyname: string
  //  }
  push(element) {
    if (this.entryMap[element.value]) {
      this.entryMap[element.value].push(element.keyname);
    } else {
      this.entryMap[element.value] = [element.keyname];

      this.heap.push(element.value);

      this._bubbleUp(this.heap.length - 1);
    }
    this.keyToTimeMap[element.keyname] = {
      expTime: element.value,
      idx: this.entryMap[element.value].length - 1
    };
  }

  pruneKey(keyName) {
    if (this.keyToTimeMap[keyName]) {
      const keyInfo = this.keyToTimeMap[keyName];
      this.entryMap[keyInfo.expTime].splice(keyInfo.idx, 1);
    }
  }

  getNextExpTime() {
    return this.heap[0];
  }

  pop() {
    const result = this.heap[0];
    const end = this.heap.pop();

    if (this.heap.length > 0) {
      this.heap[0] = end;
      this._sinkDown(0);
    }

    // Append all stored key names to result data
    const allKeys = {
      allKeys: this.entryMap[result]
    };
    // Remove result data for this entry
    delete this.entryMap[result];

    return allKeys;
  }

  size() {
    return this.heap.length;
  }

  _bubbleUp(idx) {
    const element = this.heap[idx];

    while (idx > 0) {
      const parentIdx = Math.floor((idx + 1) / 2) - 1;
      const parent = this.heap[parentIdx];

      // If parent has smaller value, order is correct
      if (parent < element) {
        break;
      }

      // Otherwise, swap them
      this.heap[parentIdx] = element;
      this.heap[idx] = parent;
      idx = parentIdx;
    }
  }

  _sinkDown(idx) {
    const length = this.heap.length;
    const element = this.heap[idx];

    while (true) {
      const child2idx = (idx + 1) * 2;
      const child1idx = child2idx - 1;

      let swap;
      let child1;

      if (child1idx < length) {
        child1 = this.heap[child1idx];

        if (child1 < element) {
          swap = child1idx;
        }
      }

      if (child2idx < length) {
        const child2 = this.heap[child2idx];

        if (child2 < (typeof swap === "undefined" ? element : child1)) {
          swap = child2idx;
        }
      }

      if (typeof swap === "undefined") {
        break;
      }

      this.heap[idx] = this.heap[swap];
      this.heap[swap] = element;
      idx = swap;
    }
  }
}

// Extends native ES6 Map object
class SnapMap extends Map {
  constructor(...args) {
    // Pass any and all args to parent constructor
    super(...args);

    this.heap = new ExpMinHeap();
    this.expirationTimer = null;
  }

  // expiresIn: Time period in milliseconds after which the entry is automatically erased.
  set(key, value, ttl) {
    if (super.has(key)) {
      this.heap.pruneKey(key);
    }

    // Store new pair in parent Map
    super.set(key, value);

    if (typeof ttl !== "undefined") {
      // If new value expires sooner than current expiry, stop timer to reset
      const expTime = Date.now() + ttl;

      this.heap.push({
        value: expTime,
        keyname: key
      });

      if (this.heap.getNextExpTime() === expTime) {
        this._stopExpirationTimer();
      }

      if (this.expirationTimer === null) {
        // Restart timer
        this.expirationTimer = setTimeout(
          () => this._expirationTimerTick(),
          ttl + Date.now()
        );
      }
    }
  }

  _stopExpirationTimer() {
    if (this.expirationTimer !== null) {
      // Clear out expiration timer
      clearTimeout(this.expirationTimer);
      this.expirationTimer = null;
    }
  }

  _expirationTimerTick() {
    // Remove timer reference
    this.expirationTimer = null;

    // Remove expiring keys
    const expiredKeys = this.heap.pop().allKeys;

    if (expiredKeys.length > 1) {
      expiredKeys.forEach(key => this.delete(key));
    } else {
      this.delete(expiredKeys[0]);
    }

    // If more expiring keys coming up, restart timer
    if (this.heap.size() > 0) {
      this.expirationTimer = setTimeout(
        () => this._expirationTimerTick(),
        this.heap.getNextExpTime() - Date.now()
      );
    }
  }
}

module.exports = SnapMap;
