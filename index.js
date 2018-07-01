const mysql = require("mysql");
const { promisify } = require("util");

module.exports = ({ host, database, user, password }) => {
  const globals = {};

  const connect = function connect() {
    const connection = mysql.createConnection({
      host,
      user,
      password,
      database
    });

    return promisify(connection.connect.bind(connection))()
      .then(() => promisify(connection.query.bind(connection)))
      .then(query => {
        const formatValue = function formatValue(value) {
          switch (typeof value) {
            case "number":
              return value;
            case "string":
              return `'${value}'`;
            case "undefined":
              return "null";
            default:
              return `'${JSON.stringify(value)}'`;
          }
        };

        const wheres = function wheres(obj = {}) {
          const conditions = Object.keys(obj)
            .map(k => `${k} = ${formatValue(obj[k])}`)
            .join(" AND ");

          return conditions ? `WHERE ${conditions}` : "";
        };

        const environment = {
          createJob: function createJob({ queue, data, priority, status }) {
            return query(`
          INSERT INTO jobs(queue, data, priority, status)
          VALUES('${queue}', '${JSON.stringify(
              data
            )}', ${priority}, '${status}')
          `).then(({ insertId }) => insertId);
          },
          readJob: function readJob(criteria) {
            return query(`
          SELECT * FROM jobs 
          ${wheres(criteria)}
          `).then(jobs =>
              jobs.map(j => Object.assign({}, j, { data: JSON.parse(j.data) }))
            );
          },
          updateJob: function updateJob(id, { status, error }) {
            return query(`
          UPDATE jobs
          SET status = '${status}' ${error ? `, error = ${error}` : ""}
          WHERE _id = ${id}
          `);
          },
          createLock: function createLock({
            job,
            queue,
            worker,
            status,
            blocker
          }) {
            return query(`
          INSERT INTO locks(job, queue, worker, blocker, status)
          VALUES(${job}, '${queue}', ${formatValue(worker)}, ${formatValue(
              blocker
            )}, '${status}')
          `).then(({ insertId }) => insertId);
          },
          readLock: function readLock(criteria) {
            return query(`
          SELECT * FROM locks 
          ${wheres(criteria)}
          `);
          },
          updateLock: function updateLock(criteria, { status }) {
            return query(`
          UPDATE locks
          SET status = '${status}'
          ${wheres(criteria)}
          `);
          }
        };

        globals.connection = connection;
        globals.query = query;

        return query(`CREATE TABLE IF NOT EXISTS jobs(
              _id int not null primary key auto_increment,
              queue varchar(255) not null,
              data json not null,
              priority int not null,
              status enum ('new', 'blocked', 'done', 'failed') not null,
              error varchar(1000)
            )`)
          .then(() =>
            query(`CREATE TABLE IF NOT EXISTS locks(
              _id int not null primary key auto_increment,
              queue varchar(255) not null,
              worker char(36),
              blocker char(36),
              job int not null,
              status enum ('locking', 'locked', 'backed-off'),

              FOREIGN KEY fk_job(job)
              REFERENCES jobs(_id)
              ON UPDATE CASCADE
              ON DELETE CASCADE
            )`)
          )
          .then(() => environment);
      });
  };

  const refresh = function() {
    return globals.query("DELETE FROM jobs");
  };

  const disconnect = function() {
    const connection = globals.connection;
    return promisify(connection.end.bind(connection))();
  };

  return { connect, refresh, disconnect };
};
