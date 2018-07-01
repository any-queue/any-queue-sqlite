"use strict";
const testIntegration = require("any-queue-test");
const mysqlConnector = require(".");

process.on("unhandledRejection", err => {
  throw err;
});

testIntegration({
  name: "mysql",
  createPersistenceInterface: () =>
    mysqlConnector({
      uri: "mysql://root:admin@localhost/any-queue"
    })
});
