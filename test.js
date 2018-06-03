"use strict";

const testIntegration = require("../any-queue-test/index.js");
const { connect, initialize, refresh, disconnect } = require(".")({
  host: "localhost",
  rootUser: "root",
  rootPassword: "admin",
  user: "any_queue_test_user",
  password: "any_queue_test_password",
  database: "any_queue_test"
});

testIntegration({ name: "mysql", connect, initialize, refresh, disconnect });
