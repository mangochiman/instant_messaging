var bookshelf = require('../config/bookshelf').bookshelf;

var News = bookshelf.Model.extend({
    tableName: 'news',
    idAttribute: 'news_id'
});

var Tracker = bookshelf.Model.extend({
    tableName: 'tracker',
    idAttribute: 'tracker_id'
});

models = {News: News, Tracker: Tracker};

module.exports = models;
