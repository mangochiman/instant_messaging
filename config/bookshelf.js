var config = require('../config/database');
var connection = config.connection;
var host = connection.host;
var user = connection.user;
var database = config.database;
var password = connection.password;

dbConfig = {
  client: 'mysql',
  connection: {
    host     : host,
    user     : user,
    password : password,
    database : database,
    charset  : 'utf8'
  }
}

var knex = require('knex')(dbConfig);
bookshelf = require('bookshelf')(knex);
tools = {knex : knex, bookshelf: bookshelf}

module.exports = tools;

