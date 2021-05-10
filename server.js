const express = require('express')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const app = express();
// Outils
const path = require('path');
app.use(cookieParser()); // Permet l'authentification!
app.use(express.json()); // Permet de recevoir des requêtes JSON!
app.use(express.urlencoded({ extended: true })); // Decodeur de body
app.use(express.static('public')); //Resources css/js/imgs
app.use(session({
    secret: 'clé secret?', // Clé unique!
    resave: false, // Conserver la session?
    saveUninitialized: true
}))

// Routes
const api_routes = require('./routes/routes_api')
const login_routes = require('./routes/routes_vitrine')
const dashboard_routes = require('./routes/routes_dashboard')

// CORS
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
    res.header("Access-Control-Allow-Headers", 'Content-type,Accept,X-access-Token,X-Key')
    if(req.method == 'OPTIONS') {
        res.status(200).end()
    } else {
        next();
    }
})

app.use('/', login_routes, dashboard_routes)
app.use('/api', api_routes)

// Démarrer le serveur en mettant sur écoute le port
app.listen(8080, function() {
    console.log('Server is running on port 8080')
})