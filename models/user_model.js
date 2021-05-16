const db = require('../db')

class User {
    constructor(request) {
        this.request = request
        this.iduser = request.session.userID
        this.isconnected = request.session.isConnected
    }

    checkUser(username, password, fun){
        db.query("SELECT iduser, username, password FROM user WHERE username=?;", username, (error, result) => {
            if(error) {
                return fun(false)
            } else if(result.length > 0 && result[0].username === username && result[0].password === password) { 
                this.request.session.isConnected = true;
                this.request.session.userID = result[0].iduser;
                fun(true)
            } else {
                fun(false)
            }
        })
    }

    logout(fun){
        if (this.isconnected) {
            this.request.session.destroy();   
        }
        fun()
    }

    registerUser(name, lastname, email, username, password, fun){
        if(name === undefined || lastname === undefined || username === undefined || email === undefined || password === undefined) return fun(true)
        db.query("INSERT INTO user (username, password, email, name, lastname) VALUES (?, ?, ?, ?, ?);", [username, password, email, name, lastname], (error) => {
            if (!error) {
                this.checkUser(username, password, () => {})
            }
        })
    }
}

module.exports = User;