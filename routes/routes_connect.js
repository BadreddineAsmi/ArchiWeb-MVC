let express = require('express');
let router = express.Router({strict: true});
let login_controller = require('../controllers/login_controller')


// Controler si l'utilisateur est connectée!
// Si il est connectée on appelle next et donne la main au routes suivantes
// Sinon on le redirige vers la page de connexion!
router.get('/', login_controller.checkUser);

// Page de connexion
router.get('/login', login_controller.showLoginPage);

// Page d'enregistrement
router.get('/register', login_controller.showRegisterPage);

// Page qui controlera les identifiants utilisateurs!
router.post('/connect', login_controller.checkLogins);

// Page qui créera un compte d'utilisateurs!!
router.post('/confirmRegistration', login_controller.confirmRegistration);

// Page de deconnexion!
router.get('/logout', login_controller.logout)

// Attraper toutes les requêtes qui sorte du cadres login!
// Tant que l'utilisateur n'est pas enregistré/connecté on ne veux pas qu'il aille ailleur!
router.get('/:any', login_controller.checkUser);

module.exports = router