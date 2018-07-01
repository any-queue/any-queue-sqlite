const mysql = require("mysql");
const { promisify } = require("util");
const inquirer = require("inquirer");

inquirer
  .prompt([
    {
      name: "host",
      message: "Mysql host:",
      default: "localhost"
    },
    {
      name: "database",
      message: "Mysql database name for anyqueue:",
      default: "anyqueue"
    },
    {
      name: "admin.user",
      message: "Mysql admin username:",
      default: "root"
    },
    {
      type: "password",
      name: "admin.password",
      message: "Mysql admin password:",
      default: false
    },
    {
      name: "anyqueue.user",
      message: "Mysql username for anyqueue:",
      default: "anyqueue"
    },
    {
      type: "password",
      name: "anyqueue.password",
      message: "Mysql password for anyqueue:",
      default: false
    }
  ])
  .then(answers => {
    const connection = mysql.createConnection({
      host: answers.host,
      user: answers.admin.user,
      password: answers.admin.password
    });

    return promisify(connection.connect.bind(connection))()
      .then(() => promisify(connection.query.bind(connection)))
      .then(query =>
        query(`CREATE DATABASE IF NOT EXISTS ${answers.database}`)
          .then(() =>
            query(
              `CREATE USER IF NOT EXISTS '${answers.user}'@'${answers.host}'`
            )
          )
          .then(() =>
            query(
              `GRANT ALL ON ${answers.database}.* To '${
                answers.anyqueue.user
              }'@'${answers.host}' IDENTIFIED BY '${
                answers.anyqueue.password
              }';`
            )
          )
          .then(() => query("FLUSH PRIVILEGES"))
      )
      .catch(error =>
        promisify(connection.end.bind(connection))().then(() => {
          throw error;
        })
      )
      .then(promisify(connection.end.bind(connection)));
  })
  /* eslint-disable no-console */
  .then(() => console.log("Database initialized! 🎉🎉"))
  .catch(error => console.error(error));
