#

# any-queue-sqlite

[![npm version](https://img.shields.io/npm/v/any-queue-sqlite.svg)](https://www.npmjs.com/package/any-queue-sqlite)

> SQLite persistence interface for any-queue

## Install

```
$ npm install --save any-queue-sqlite
```

## Usage

```js
import { Queue } from "any-queue";
import anyQueueSqlite from "any-queue-sqlite";

const persistenceInterface = anyQueueSqlite({
  uri: "sqlite://root:nt3yx7ao2e9@localhost/any-queue-demo"
});

const queue = Queue({ persistenceInterface, name: "foo" });
```

## API

### anyQueueSqlite({ uri, config })

Returns a sqlite connector.

* `uri` - db uri
* `config` - dialectOptions, as described in [sequelize docs](http://docs.sequelizejs.com/class/lib/sequelize.js~Sequelize.html#instance-constructor-constructor)

## License

MIT © Gerardo Munguia
