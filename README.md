#

# any-queue-mysql

[![npm version](https://img.shields.io/npm/v/any-queue-mysql.svg)](https://www.npmjs.com/package/any-queue-mysql)

> MySQL persistence interface for any-queue

## Install

```
$ npm install --save any-queue-mysql
```

## Usage

```js
import { Queue } from "any-queue";
import anyQueueMysql from "any-queue-mysql";

const persistenceInterface = anyQueueMysql({
  uri: "mysql://root:nt3yx7ao2e9@localhost/any-queue-demo"
});

const queue = Queue({ persistenceInterface, name: "foo" });
```

## API

### anyQueueMysql({ uri, config })

Returns a mysql connector.

* `uri` - db uri
* `config` - dialectOptions, as described in [sequelize docs](http://docs.sequelizejs.com/class/lib/sequelize.js~Sequelize.html#instance-constructor-constructor)

## License

MIT © Gerardo Munguia
