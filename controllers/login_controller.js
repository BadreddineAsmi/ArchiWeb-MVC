const User = require('../models/user_model');

exports.showRegisterPage = function(request, response, next) {
    const info = new User(request)
    if (!info.isconnected) {
        response.render('registerPage.ejs', { loginPage: 'login', confirmRegister: 'confirmRegistration' });
    } else {
        next();
    }
}

exports.showLoginPage = function(request, response, next) {
    const info = new User(request)
    if (!info.isconnected) {
        response.render('loginPage.ejs', { loginPath: 'connect', registerPath: 'register' })
    } else {
        next();
    }
}

exports.checkLogins = function(request, response, next) {
    const info = new User(request)
    const username = request.body.user
    const password = request.body.password
    info.checkUser(username, password, (ok) => {
        if(ok){
            response.redirect('/');
        } else {
            response.send('Votre nom d\'utilisateur ou votre mot de passe est incorrecte!</br><a href="/">Retour</a>');
        }
    })
}

exports.confirmRegistration = function(request, response, next) {
    const info = new User(request)
    if (!info.isconnected) {
        const firstname = request.body.fname
        const name = request.body.name
        const username = request.body.username
        const email = request.body.email
        const password = request.body.password
        info.registerUser(firstname, name, email, username, password)
    }
    response.redirect('/');
}

exports.checkUser = function(request, response, next) {
    const info = new User(request)
    if(info.isconnected){
        next()
    } else {
        response.redirect('/login');
    }
}

exports.logout = function(request, response) {
    const info = new User(request)
    info.logout(() => {
        response.redirect('/');
    })
}