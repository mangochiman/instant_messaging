
module.exports = function loadUser(req, res, next) {

    if (!req.isAuthenticated()) {
        res.redirect('/sign_in');
    } else {
        next();
    }
}