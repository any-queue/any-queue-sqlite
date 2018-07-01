const Sequelize = require("sequelize");
const assert = require("assert");
const debug = require("debug");

module.exports = ({ uri, config }) => {
  let sequelize;
  let Job;
  let Lock;
  let connectionCount = 0;
  let connecting;
  let connected = false;
  const log = debug("anyqueue:mysql:");

  const connect = function connect() {
    log("connecting");
    // TBD should we reuse connection?
    ++connectionCount;
    if (connecting) return connecting;

    log("creating new connection");

    sequelize = new Sequelize(uri, {
      // TODO: configure connection pool

      // Only used in sqlite connections.
      storage: "./.tmp/database.sqlite",

      // Allow the user inject db-specific config.
      dialectOptions: config,

      operatorsAliases: false,

      // Don't construct Model instances from query results, so that results can be treated as plain objects.
      query: {
        raw: true
      },

      // Sequelize already logs through `debug` internaly.
      logging: false
    });

    Job = sequelize.define("job", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      queue: { type: Sequelize.STRING },
      // cannot use JSON type with sqlite. For some reason, it randomly drops "data" property if it is JSON. We will store data as string instead, and parse/stringify on read/write.
      data: { type: Sequelize.STRING },
      priority: { type: Sequelize.INTEGER },
      status: { type: Sequelize.STRING },
      processDate: { type: Sequelize.STRING },
      scheduledDate: { type: Sequelize.STRING }
    });

    Lock = sequelize.define("lock", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      job: { type: Sequelize.INTEGER },
      queue: { type: Sequelize.STRING },
      worker: { type: Sequelize.STRING },
      status: { type: Sequelize.STRING },
      blocker: { type: Sequelize.INTEGER }
    });

    connecting = sequelize.sync().then(() => {
      connected = true;
      log("connected");
    });

    return connecting;
  };

  const createJob = function createJob(job) {
    assert(connected, "connect first");
    return Job.create(
      // See comment in model definition.
      Object.assign({}, job, { data: JSON.stringify(job.data) })
    ).then(({ id }) => id);
  };

  const readJob = function readJob(query) {
    assert(connected, "connect first");

    // See comment in model definition.
    const parseData = job =>
      Object.assign({}, job, { data: JSON.parse(job.data) });

    return Job.findAll({ where: query }).then(jobs => jobs.map(parseData));
  };

  const updateJob = function updateJob(id, props) {
    assert(connected, "connect first");
    return Job.update(props, { where: { id } });
  };

  const createLock = function createLock(lock) {
    assert(connected, "connect first");
    return Lock.create(lock).then(({ id }) => id);
  };

  const readLock = function readLock(query) {
    assert(connected, "connect first");
    return Lock.findAll({ where: query });
  };

  const updateLock = function updateLock(query, props) {
    assert(connected, "connect first");
    return Lock.update(props, { where: query });
  };

  const refresh = function refresh() {
    assert(connected, "connect first");
    return Promise.all([
      Job.destroy({ truncate: true }),
      Lock.destroy({ truncate: true })
    ]);
  };

  const disconnect = function disconnect() {
    assert(connected, "connect first");

    --connectionCount;
    if (connectionCount > 0) return Promise.resolve();
    assert.equal(connectionCount, 0);

    connected = false;
    connecting = undefined;

    log("disconnecting");

    return sequelize.close();
  };

  return {
    connect,
    disconnect,
    createJob,
    readJob,
    updateJob,
    createLock,
    readLock,
    updateLock,
    refresh
  };
};
