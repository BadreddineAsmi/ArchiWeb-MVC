const mysql = require('mysql')
const connection = mysql.createConnection({
    host : 'localhost',
    user: 'root',
    password: 'root',
    database: 'users',
});
connection.connect(function (error) { if(error) { console.log('Une erreur s\'est produite lors de la connection avec la base de données: '+error); }})

module.exports = connection