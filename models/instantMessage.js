var bookshelf = require('../config/bookshelf').bookshelf;

var ChatDetails = bookshelf.Model.extend({
    tableName: 'chat_details',
    idAttribute: 'chat_id'
});

var GroupMemberShip = bookshelf.Model.extend({
    tableName: 'group_membership'
});

var Group = bookshelf.Model.extend({
    tableName: 'group',
    idAttribute: 'group_id'
});

var User = bookshelf.Model.extend({
   tableName: 'user',
   idAttribute: 'user_id',
});

models = {ChatDetails: ChatDetails, GroupMemberShip: GroupMemberShip, Group: Group, User: User};

module.exports = models;
