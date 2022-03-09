const User = require('../models/user');

module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register');
}

module.exports.register = async(req, res, next) => {
    const { email, username, password } = req.body;
    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, err => {
        if (err) return next(err);
        req.flash('success', 'Successfully registered a new user!');
        res.redirect('/hotels');
    })
}

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', "Welcome Back!");
    const redirectUrl = req.session.returnTo || '/hotels';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye!');
    res.redirect('/hotels');
}