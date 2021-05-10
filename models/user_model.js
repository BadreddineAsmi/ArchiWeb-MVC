class User {
    constructor(db) {
        this.db = db
    }

    checkUser(username, password, fun){
        db.query("SELECT iduser, username, password FROM user WHERE username=?;", username, (error, result) => {
            if(error) {
                return response.status(400).json(error)
            }
            if(result.length > 0) { // On controle si le resultat n'est pas vide!
                if(result[0].username === username && result[0].password === password){
                    request.session.isConnected = true;
                    request.session.userID = result[0].iduser;
                    response.status(200).json({error: false, message: 'Connecté avec succes!'})
                } else {
                    response.status(400).json({error: true, message: 'Nom d\'utilisateur ou mot de passe incorrecte!'})
                }
            } else {
                response.status(404).json({error: true, message: 'L\'utilisateur n\'a pas été trouvé!'});
            }
        })
    }
}

module.exports = User;