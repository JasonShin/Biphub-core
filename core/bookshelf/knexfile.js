const path = require('path')

// TODO: Currently Knex doesn't allow sqlite file inside core folder.
module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, '/../../content/data/biphub-dev.sqlite3'),
    },
    debug: true,
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user: 'username',
      password: 'password',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user: 'username',
      password: 'password',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
  debug: false,
}
