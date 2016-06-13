/**
 * Created by barrett on 8/28/14.
 * Used by mangochiman in Nov 2015
 */

var mysql = require('mysql');
var dbconfig = require('./config/database');

var connection = mysql.createConnection(dbconfig.connection);
connection.query('DROP DATABASE IF EXISTS ' + dbconfig.database);
connection.query('CREATE DATABASE ' + dbconfig.database);

connection.query('\
CREATE TABLE `' + dbconfig.database + '`.`user` ( \
    `user_id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `fname` VARCHAR(100) NOT NULL, \
    `lname` VARCHAR(100) NOT NULL, \
    `username` VARCHAR(100) NOT NULL, \
    `password` CHAR(100) NOT NULL, \
    `date_created` DATE NOT NULL, \
     PRIMARY KEY (`user_id`)\
)');

connection.query('\
CREATE TABLE `' + dbconfig.database + '`.`group` ( \
    `group_id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `name` VARCHAR(100), \
    `color` CHAR(100), \
     PRIMARY KEY (`group_id`)\
)');

connection.query('\
CREATE TABLE `' + dbconfig.database + '`.`group_membership` ( \
    `group_id` INT UNSIGNED NOT NULL, \
    `user_id` INT UNSIGNED NOT NULL \
)');

connection.query('\
CREATE TABLE `' + dbconfig.database + '`.`chat_details` ( \
    `chat_id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `sender_id` INT NOT NULL, \
    `content` text, \
    `recepient_id` INT NOT NULL, \
     PRIMARY KEY (`chat_id`)\
)');

console.log('Success: Database Created!')

connection.end();
