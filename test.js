"use strict";

const testIntegration = require("../any-queue-test/index.js");
const { connect, initialize, refresh, disconnect } = require(".");
testIntegration({ name: "mysql", connect, initialize, refresh, disconnect });
