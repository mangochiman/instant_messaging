var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var bcrypt = require('bcrypt-nodejs');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// model
var model = require('./models/instantMessage');

var app = express();
var socket_io = require("socket.io");
var io = socket_io();
app.io = io;
//var socketRoutes = require('./routes/index')(io);

/*io.on("connection", function (socket)
 {
 console.log("A user connected");
 });*/


var usernames = {};

io.on('connection', function (socket) {
    socket.on('sendchat', function (data) {
        //console.log(data)
        userData = {username: socket.username, usercolor: socket.usercolor}
        console.log("Here")
        console.log(userData)
        io.emit('updatechat', userData, data);
    });

    // when the client emits 'adduser', this listens and executes
    socket.on('adduser', function (userData) {
       // console.log(userData)
        socket.username = userData.username;
        socket.usercolor = userData.usercolor;
        socket.userid = userData.userid;
        usernames[userData.username] = [userData.username, userData.userid];
        serve_data = {username: 'Notification', usercolor: userData.usercolor}
        socket.emit('updatechat', serve_data, 'you have connected');
        
        socket.broadcast.emit('updatechat', serve_data, userData.username + ' has connected');
        userData = {username: userData.username, usercolor: userData.usercolor}
        io.emit('updateusers', usernames);
    });

    socket.on('disconnect', function () {
        //console.log('User has left chat')
        delete usernames[socket.username];
        io.emit('updateusers', usernames);
        // echo globally that this client has left
        serve_data = {username: 'Notification', usercolor: socket.usercolor}
        socket.broadcast.emit('updatechat', serve_data, socket.username + ' has disconnected');
    });
});





passport.use(new LocalStrategy(function (username, password, done) {
    new model.User({username: username}).fetch().then(function (data) {
        var user = data;
        if (user === null) {
            return done(null, false, {message: 'Invalid username or password'});
        } else {
            user = data.toJSON();
            if (!bcrypt.compareSync(password, user.password)) {
                return done(null, false, {message: 'Invalid username or password'});
            } else {
                return done(null, user);
            }
        }
    });
}));

passport.serializeUser(function (user, done) {
    done(null, user.username);
});

passport.deserializeUser(function (username, done) {
    new model.User({username: username}).fetch().then(function (user) {
        done(null, user);
    });
});

// view engine setup
app.engine('.html', require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({secret: 'secret strategic xxzzz code'}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);
app.use('/users', users);

app.use('/sign_in', routes);
app.use('/users', users);
app.use('/process_authentication', users);
app.use('/sign_out', routes);

app.use('/add_group', routes);
app.use('/create_group', routes);
app.use('/delete_group', routes);
app.use('/process_delete_group', routes);
app.use('/add_member', routes);
app.use('/create_member', routes);
app.use('/delete_member', routes);
app.use('/process_delete_member', routes);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
