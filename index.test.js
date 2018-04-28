const SnapMap = require("./index");

// Add a percentage
const addErrorToValue = (val, percentError) => {
  const errorFactor = percentError / 100;
  const errorAmt = errorFactor * val;
  return errorAmt + val;
};

test("stores key/value pairs like a normal map", () => {
  const sm = new SnapMap();

  // Generate random value for posterity
  const key = "random-value";
  const value = Math.random() * 10;

  sm.set(key, value);

  expect(sm.get(key)).toBe(value);
});

test("expires data after a given time period", done => {
  const sm = new SnapMap();

  const expirationTime = 10;

  // Generate random value for posterity
  const key = "random-value";
  const value = Math.random() * 10;

  sm.set(key, value, expirationTime);

  const existsImmediately = sm.get(key) === value;
  expect(existsImmediately).toBe(true);

  setTimeout(() => {
    const existsAfterInterval = sm.get(key) === value;
    expect(existsAfterInterval).toBe(false);
    done();
  }, expirationTime);
});

test("expires data added consecutively with same expiration time", done => {
  const sm = new SnapMap();

  const expirationTime = 30;

  // Generate random value for posterity
  const keys = [];
  const values = [];
  for (let i = 1; i < 6; i++) {
    let newKey = `random-value-${i}`;
    let newVal = Math.random() * 10;
    keys.push(`random-value-${i}`);
    values.push(Math.random() * 10);

    sm.set(newKey, newVal, expirationTime);

    expect(sm.get(newKey)).toBe(newVal);
  }

  setTimeout(() => {
    for ([k, key] of keys.entries()) {
      const existsAfterInterval = sm.get(key) === values[k];
      expect(existsAfterInterval).toBe(false);
    }

    done();
  }, expirationTime);
});

test("resets expiration time on update via set() call", done => {
  const sm = new SnapMap();

  const expirationTime1 = 100;
  const expirationTime2 = 200;

  const key = "volatile-key";
  // Random value for posterity
  const val = Math.random() * 10;

  // Add data to expire in 100 ms
  sm.set(key, val, expirationTime1);

  // Key should still exist after expiration time since we will update it
  setTimeout(() => {
    const existsAfterFirstInterval = sm.has(key);
    expect(existsAfterFirstInterval).toBe(true);
  }, expirationTime1);

  // Key should be gone after new expiration elapses
  setTimeout(() => {
    expect(sm.has(key)).toBe(false);
    done();
  }, addErrorToValue(expirationTime2, 5)); // 5% grace period to account for processing above code

  // Perform the actual update which should reset the timer
  const newVal = Math.random() * 10;
  sm.set(key, newVal, expirationTime2);
});

test("expires data in correct order regardless of set order", done => {
  const sm = new SnapMap();

  const expirationTime1 = 100;
  const expirationTime2 = 200;

  const key1 = "expires-first";
  const key2 = "expires-second";

  const val1 = Math.random() * 100;
  const val2 = Math.random() * 100;

  // IMPORTANT PART OF THE TEST
  // Set second expiration first
  sm.set(key2, val2, expirationTime2);
  // Then first expiration
  sm.set(key1, val1, expirationTime1);

  // After first expiration time, key1 should be gone, key2 should still be alive
  setTimeout(() => {
    expect(sm.has(key1)).toBe(false);
    expect(sm.get(key2)).toBe(val2);
  }, expirationTime1);

  // After second expiration, both key1 and key2 should be gone
  setTimeout(() => {
    expect(sm.has(key1)).toBe(false);
    expect(sm.has(key2)).toBe(false);
    done();
  }, addErrorToValue(expirationTime2, 5));

  // Both keys should exist
  expect(sm.get(key1)).toBe(val1);
  expect(sm.get(key2)).toBe(val2);
});
