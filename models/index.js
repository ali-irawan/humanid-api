'use strict'

const fs = require('fs'),
  path = require('path'),
  Sequelize = require('sequelize'),
  Umzug = require('umzug'),  
  helper = require('../helpers/helper'),
  basename = path.basename(__filename),
  env = process.env.NODE_ENV || 'development',
  config = helper.config.DATABASE,
  db = {}

let sequelize
if (env === 'test') {
  // override config for testing  
  sequelize = new Sequelize(
    config.database || 'humanid',
    config.username || 'root',
    config.password,
    {dialect: 'sqlite', logging: false}
  )
} else if (process.env.JAWSDB_URL) {
  // for heroku
  sequelize = new Sequelize(process.env.JAWSDB_URL)  
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config)
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
  })
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file))
    db[model.name] = model
  })

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

// automigrate
const umzug = new Umzug({
  storage: 'sequelize',  
  storageOptions: {
    sequelize: sequelize
  },
  migrations: {
    params: [
      sequelize.getQueryInterface(),
      Sequelize
    ],
    path: path.join(__dirname, '../migrations')
  }
})


db.sequelize = sequelize
db.Sequelize = Sequelize

db.migrate = async () => {
  return umzug.up()  
}

module.exports = db