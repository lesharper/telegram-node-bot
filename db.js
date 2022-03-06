const {Sequelize} = require('sequelize');

module.exports = new Sequelize(
    'tgbot',
    'postgres',
    'lesharper',
    {
        host: 'localhost',
        port: '5432',
        dialect: 'postgres'
    }
)