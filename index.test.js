const SnapMap = require("./index");

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

test("resets expiration time on data update", done => {
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
    done();
  }, expirationTime1);

  const newVal = Math.random() * 10;
  sm.set(key, newVal, expirationTime2);
});
