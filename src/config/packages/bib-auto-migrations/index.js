const Sequelize = require('sequelize')
const path = require('path')
const Umzug = require('umzug')
let db = process.env.DB_NAME || 'db_name'
let user = process.env.DB_USER || 'db_user'
let password = process.env.DB_PASS || 'db_pass'
let host = process.env.DB_HOST || 'db_host'
let port = Number(process.env.DB_PORT) || 1433
// creates a basic sqlite database
const sequelize = new Sequelize(db, user, password, {
  host: host,
  dialect: 'postgres',
  dialectOptions: {
    encrypt: true,
  },
  port: port,
  logging: false,
})

const umzug = new Umzug({
  migrations: {
    // indicates the folder containing the migration .js files
    path: path.join(__dirname, '../../../../../src/migrations'),
    pattern: /\.js$/,
    // inject sequelize's QueryInterface in the migrations
    params: [sequelize.getQueryInterface(), Sequelize],
  },
  // indicates that the migration data should be store in the database
  // itself through sequelize. The default configuration creates a table
  // named `SequelizeMeta`.
  storage: 'sequelize',
  storageOptions: {
    sequelize: sequelize,
  },
})
module.exports = umzug
