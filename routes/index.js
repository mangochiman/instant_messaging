var express = require('express');
var router = express.Router();
var model = require('../models/instantMessage');
var knex = require('../config/bookshelf').knex;
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var loadUser = require('../force_login');

User = model.User;
Group = model.Group;
ChatDetails = model.ChatDetails;
GroupMemberShip = model.GroupMemberShip;

/* GET home page. */
router.get('/', loadUser, function (req, res, next) {
    res.redirect('/index');
});

router.get('/index', loadUser, function (req, res, next) {
    var user = req.user.toJSON();
    res.render('index', {user: user});

});

router.get('/sign_in', function (req, res, next) {
    console.log(req.isAuthenticated())
    if (req.isAuthenticated())
        res.redirect('/');


    res.render('sign_in', {title: 'Sign In'});
});

router.post('/process_authentication', function (req, res, next) {
    passport.authenticate('local', {successRedirect: '/',
        failureRedirect: '/sign_in'}, function (err, user, info) {
        if (err) {
            return res.render('sign_in', {title: 'Sign In', errorMessage: err.message});
        }

        if (!user) {
            return res.render('sign_in', {title: 'Sign In', errorMessage: info.message});
        }
        return req.logIn(user, function (err) {
            if (err) {
                return res.render('sign_in', {title: 'Sign In', errorMessage: err.message});
            } else {
                return res.redirect('/index');
            }
        });
    })(req, res, next);
});

router.get('/sign_out', function (req, res, next) {
    if (!req.isAuthenticated()) {
        notFound404(req, res, next);
    } else {
        req.logout();
        res.redirect('/sign_in');
    }
});

router.get('/add_group', function (req, res, next) {
    knex('group').then(function (groups) {
        res.render('add_group', {groups: groups});
    });
});

router.post('/create_group', function (req, res, next) {
    console.log(req.body)
    group_name = req.body.group_name;
    group_description = req.body.group_description; //Add group_description later;

    new Group({
        name: group_name,
    }).save().then(function (group) {
        res.redirect("/add_group");
    })

});

router.get('/add_member', function (req, res, next) {
    knex('group').then(function (groups) {
        res.render('add_member', {groups: groups});
    });
});

router.post('/create_member', function (req, res, next) {
    var password = req.body.password;
    var password_hash = bcrypt.hashSync(password);
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var username = req.body.username;
    var group_id = req.body.group_id;

    new User({
        fname: first_name,
        lname: last_name,
        username: username,
        password: password_hash
    }).save().then(function (user) {
        user_id = user.id;
        new GroupMemberShip({
            group_id: group_id,
            user_id: user_id,
        }).save().then(function (group_member_ship) {
            res.redirect('/add_member');
        });
    });
});

module.exports = router;
