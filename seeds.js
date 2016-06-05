var model = require('./models/instantMessage');
var knex = require('./config/bookshelf').knex;

var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');

User = model.User;

		var password = 'member';
        var hash = bcrypt.hashSync(password);

        new User({
              fname: 'Admin',
              lname: 'Member',
              username: 'admin', 
              password: hash
            }).save().then(function(){
            	console.log('Default user successfully set');
            	process.exit(code=0);
            });
