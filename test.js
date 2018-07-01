"use strict";
const testIntegration = require("any-queue-test");
const sqliteConnector = require(".");

process.on("unhandledRejection", err => {
  throw err;
});

testIntegration({
  name: "sqlite",
  createPersistenceInterface: () =>
    sqliteConnector({
      uri: "sqlite://localhost/any-queue"
    })
});
