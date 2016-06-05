var express = require('express');
var router = express.Router();
var model = require('../models/instantMessage');
var knex = require('../config/bookshelf').knex;
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var loadUser = require('../force_login');

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
    res.render('add_group', {title: 'Add Group'});
});

router.get('/add_member', function (req, res, next) {
    res.render('add_member', {title: 'Add Member'});
});

module.exports = router;
