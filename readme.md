# Snapmap 📫⏳📭

[![npm version](https://badge.fury.io/js/snapmap.svg)](https://badge.fury.io/js/snapmap)

A tiny (< 1kb minified & gzip'd) extension of the ES6 [Map object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) that lets you set an expiration time for key/value pairs.

## Getting Started

```javascript
const SnapMap = require('snapmap');

const myMap = new SnapMap();
const uniqueObj = { uniqueData: [1, 2, 3] };

myMap.set(
  uniqueObj,
  `🦄`,
  10 * 1000)
);

console.log(myMap.get(uniqueObj)) // `🦄`

// More than 10 seconds later...
console.log(myMap.get(uniqueObj)) // undefined
```

## Installation

    npm install --save snapmap

## Usage

The Snapmap API is exactly the same as the [ES6 Map API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#Map_instances) with one exception: **the `set()` method accepts one extra, optional parameter.**

```javascript
class SnapMap extends Map {
  ...
  set(key: any, value: any, ttl: number?) {
    // Performs native Map operations and schedules
    // deletion if ttl is defined
  }
}
```

The optional `ttl` argument, when defined, specifies the number of milliseconds that will pass before the key/value pair is automatically deleted.

## Browser & Node.js Support

Supported everywhere that [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map), [async](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)/[await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await), and [ES6 classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes) are supported.

That means...

* All modern browsers supported
* Node 8+ supported

## Contributing

All are welcomed _and encouraged_ to contribute to this project!

    git clone https://github.com/cgatno/snapmap.git
    cd snapmap
    npm install

Even though this isn't exactly a "mission critical" or groundbreaking Node
module, I think it's a great little project to hack on if you're just getting
started with Node or looking for something fun to work on.

If you're feeling up to the challenge, please read on before jumping in! It's
really not that bad, and I promise you'll have lots of fun along the way.

### Unit Testing

I've implemented a basic [Jest](https://facebook.github.io/jest/) setup for
quick and easy unit testing.

If you're not familiar with Jest, take a look at the
[docs](https://facebook.github.io/jest/docs/en/getting-started.html) or some of
the existing tests to get started. The syntax is extremely semantic and
easy-to-read, so you'll be able to figure it out in no time.

You can run all unit tests at once using `npm run test`. Don't forget to rebuild
your code before testing!

### Versioning

I use [SemVer](http://semver.org/) for versioning. For the versions available,
see the [tags on this repository](https://github.com/cgatno/snapmap/tags).

### Communication

Even if you don't want to work on the project yourself, you can help out a lot
just by reporting any bugs you find or enhancements you want to see added!

Head over to [GitHub's issue tracker](https://github.com/cgatno/snapmap/issues) to
submit a bug report or feature request!

### Don't Be Afraid To Ask for Help!

Last but _certainly_ not least, **don't be afraid to reach out for help!** If
you have any questions, don't hesitate to
[shoot me an email](mailto:hello@christiangaetano.com)! 📫🙌

## Authors

* [Christian Gaetano](https://christiangaetano.com)

See also the list of
[contributors](https://github.com/cgatno/measuring-cup/contributors) who
participated in this project.

## License

This project is licensed under the MIT License. See the [LICENSE](license) file
for details.
