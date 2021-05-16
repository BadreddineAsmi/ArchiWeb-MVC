const im = require('../models/informationManager_model')

// Nous permet de controler si une session existe déjà!
exports.checksession = function(request, response, next) {
    const info = new im(request)
    info.api_checksession((connected, msg) => {
        if(connected){
            next()
        } else {
            response.status(400).json(msg)
        }
    })
}

// Connexion!
exports.loginUser = function(request, response) {
    const info = new im(request)
    if(request.session.isConnected) return response.status(400).json(info.api_alreadyconnected())
    const username = request.body.username
    const password = request.body.password
    info.api_login(username, password, request, (error, pass, msg, id) => {
        if(error){
            return response.status(400).json(msg)
        } else {
            if(pass){
                response.status(200).json(msg)
            } else {
                response.status(404).json(msg)
            }
        }
    })
}

// Déconnexion
exports.logoutUser = function(request, response) {
    const info = new im(request)
    info.api_disconnect((msg) => {
        response.status(200).json(msg)
    })
}

// Enregistrement
exports.registerUser = function(request, response) {
    const info = new im(request)
    const name = request.body.fname
    const lastname = request.body.name
    const username = request.body.username
    const email = request.body.email
    const password = request.body.password
    info.api_register(name, lastname, email, username, password, (error, bad, good) => {
        if(error) {
            response.status(400).json(bad)
        } else {
            response.status(200).json(good)
        }
    })
}

// Demander les projets d'un utilisateurs
exports.getProjects = function(request, response) {
    const info = new im(request)
    info.api_getProject((error, badmsg, query) => {
        if(error) {
            response.status(400).json(badmsg)
        } else {
            response.status(200).json(query)
        }
    })
}

// Rajouter un projet!
exports.addProject = function(request, response) {
    const info = new im(request)
    const name = request.body.name
    const desc = request.body.desc
    info.api_addProject(name, desc, (error, msg) => {
        if(error){
            response.status(400).json(msg)
        } else {
            response.status(200).json(msg)
        }
    })
}

// Editer un projet, nécessite une sécurité car tant que un utilisateur possède une session, celui-ci peux éditer les projets de n'importe qui dans la base de données!
exports.editProject = function(request, response) {
    const info = new im(request)
    const id = request.body.id
    const name = request.body.name
    const desc = request.body.desc
    const catID = request.body.category
    info.api_editProject(id, name, desc, catID, (error, msg) => {
        if(error){
            response.status(400).json(msg)
        } else {
            response.status(200).json(msg)
        }
    })
}

// Supprimer un projet
exports.deleteProject = function(request, response) {
    const info = new im(request)
    const projectID = parseInt(request.params.id)
    info.api_deleteProject(projectID, (error, msg) => {
        if(error){
            response.status(400).json(msg)
        } else {
            response.status(200).json(msg)
        }
    })
}

// Rajouter une tâche, nécessite une sécurité car tant qu'un utilisateur possède une session, celui-ci peux rajouter une tâche a un projet qui ne lui appartient pas
exports.addTask = function(request, response) {
    const info = new im(request)
    const projectID = request.body.id
    const name = request.body.name
    const desc = request.body.desc
    info.api_addTask(name, desc, projectID, (error, msg) => {
        if (error) {
            response.status(400).json(msg)
        } else {
            response.status(200).json(msg)
        }
    })
}

//Supprimer une tâche
exports.deleteTask = function(request, response) {
    const info = new im(request)
    const taskID = request.params.id
    info.api_deleteTask(taskID, (error, msg) => {
        if (error) {
            response.status(400).json(msg)
        } else {
            response.status(200).json(msg)
        }
    })
}

// Modifier une tâche
exports.editTask = function(request, response) {
    const info = new im(request)
    const taskid = request.body.id
    const name = request.body.name
    const desc = request.body.desc
    const catID = request.body.category
    info.api_editTask(taskid, name, desc, catID, (error, msg) => {
        if (error) {
            response.status(400).json(msg)
        } else {
            response.status(200).json(msg)
        }
    })
}