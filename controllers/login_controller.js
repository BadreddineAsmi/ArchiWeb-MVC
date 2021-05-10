const User = require('../models/user_model');

// Function to get user
function checkUser(username, pass) {
    const user = listeUsers.find(user => user.username == username);
    if (user != undefined) {
        if (user.password == pass) {
            return user;
        }
    }
    return undefined;
}

function isUserConnected(request) {
    return (request.session.userID != undefined);
}

function passUserToNext(res, user) {
    res.locals.user = user;
}

function getCurrentUser(request) {
    listeUsers.find(user => user.userID == request.session.userID);
}

// Create session for user
function createSession(req, user) {
    req.session.userID = user.userID;
}

exports.showRegisterPage = function(request, response, next) {
    if (!isUserConnected(request)) {
        response.render('registerPage.ejs', { loginPage: 'login', confirmRegister: 'confirmRegistration' });
    } else {
        passUserToNext(response, getCurrentUser(request));
        next();
    }
}

exports.showLoginPage = function(request, response, next) {
    if (!isUserConnected(request)) {
        response.render('loginPage.ejs', { loginPath: 'connect', registerPath: 'register' })
    } else {
        passUserToNext(response, getCurrentUser(request));
        next();
    }
}

exports.checkLogins = function(request, response, next) {
    let result = checkUser(request.body.user, request.body.password);
    if (result != undefined) {
        createSession(request, result);
        console.log('Utilisateur connecté!');
        passUserToNext(response, result);
        return response.redirect('/');
    } else {
        response.send('Votre nom d\'utilisateur ou votre mot de passe est incorrecte!</br><a href="/">Retour</a>');
    }
}

exports.confirmRegistration = function(request, response, next) {
    if (!isUserConnected(request)) {
        let newUser = new User(request.body.fname, request.body.name, request.body.username, request.body.email, request.body.password);
        listeUsers.push(newUser);
        createSession(request, newUser);
        passUserToNext(response, newUser);
    }
    response.redirect('/');
}

exports.checkUser = function(request, response, next) {
    if (request.session.userID != undefined) {
        const user = listeUsers.find(user => user.userID == request.session.userID);
        if (user != undefined) {
            createSession(request, user);
            passUserToNext(response, user);
            next();
        }
    } else {
        response.redirect('/login');
    }
}

exports.logout = function(request, response) {
    request.session.destroy();
    response.redirect('/');
}