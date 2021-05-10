const db = require('../db')

// Connexion!
exports.loginUser = function(request, response) {
    if(request.session.isConnected) return response.status(400).json({error: true, message: 'Vous êtes déjà connecté!'})
    const username = request.body.username
    const password = request.body.password
    if(username === undefined || password === undefined) return response.status(400).json({error: true, message: 'Les paramètres fourni sont incorrectes!'})
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

// Déconnexion
exports.logoutUser = function(request, response) {
    if(request.session.isConnected){
        request.session.destroy();
        return response.status(200).json({error: false, message: 'Vous vous êtes déconnecté avec succes!'})
    } else {
        return response.status(400).json({error: true, message: 'Vous n\'êtes pas connecté!'})
    }
}

// Enregistrement
exports.registerUser = function(request, response) {
    if(request.session.isConnected) return response.status(400).json({error: true, message: 'Vous êtes déjà connecté!'})
    const name = request.body.fname
    const lastname = request.body.name
    const username = request.body.username
    const email = request.body.email
    const password = request.body.password
    if(name === undefined || lastname === undefined || username === undefined || email === undefined || password === undefined) return response.status(400).json({error: true, message: 'Les paramètres fourni sont incorrectes!'})
    db.query("INSERT INTO user (username, password, email, name, lastname) VALUES (?, ?, ?, ?, ?);", [username, password, email, name, lastname], (error, result) => {
        if(error) {
            response.status(400).json({error: true, message: 'Une erreur s\'est produite lors de l\'ajout d\'un utilisateur!'});
        } else {
            response.status(200).json({error: false, message: 'Vous avez été enregistré avec succes!'})
        }
    })
}

// Demander les projets d'un utilisateurs
exports.getProjects = function(request, response) {
    //if(request.session.isConnected !== true) return response.status(400).json({error: true, message: 'Vous n\'êtes pas connecté!'})
    //const iduser = request.session.userID
    const iduser = 2

    db.query("SELECT idcategory, catname as pcategory, idproject, pname as projectname, pdesc, idtaskcategory as idtaskcat, TaskCatName as tcategory, taskid as idtask, taskname, taskdesc FROM category LEFT JOIN (SELECT * FROM project JOIN taskcategory LEFT JOIN task ON tcatid = idtaskCategory and pid = idproject WHERE project.authorID = ? ORDER BY idtaskCategory) AS p ON catID = idcategory;", iduser, (error, result) => {
        if(error) {
            response.status(400).json({error: true, message: 'Erreur, impossible de récuperer les projets!'});
            console.log('Error: '+error)
        } else {
            const organizedQuery = []

            result.forEach(record => {
                const project_category = record.pcategory
                const task_category = record.tcategory
                const task = {'id': record.idtask , 'name': record.taskname, 'description': record.taskdesc}
                const categorySectionTask = {'catid': record.idtaskcat, 'category': task_category, 'tasks': [task].filter(e => e.id !== null)}
                const project = {'id': record.idproject,'name': record.projectname, 'description': record.pdesc, 'tasks': [categorySectionTask]}
                const categorySection = {'catid': record.idcategory, 'category': project_category, 'projects': [project].filter(e => e.id !== null)}
                const categoryExists = organizedQuery.find(cat => cat.category === project_category)

                if(!categoryExists) {
                    organizedQuery.push(categorySection)
                } else {
                    const projectExists = categoryExists.projects.find(p => p.id === project.id)
                    if(!projectExists){
                        categoryExists.projects.push(project)
                    } else {
                        const taskCategoryExists = projectExists.tasks.find(t => t.category === task_category)
                        if(!taskCategoryExists){
                            projectExists.tasks.push(categorySectionTask)
                        } else {
                            taskCategoryExists.tasks.push(task)
                        }
                    }
                }
            })

            response.status(200).json(organizedQuery)
        }
    })
}

// Rajouter un projet!
exports.addProject = function(request, response) {
    //if(request.session.isConnected !== true) return response.status(400).json({error: true, message: 'Vous n\'êtes pas connecté!'})
    //const iduser = request.session.userID
    const iduser = 2
    const name = request.body.name
    const desc = request.body.desc
    if (name === undefined || desc === undefined) return response.status(400).json({error: true, message: 'Les paramètres fourni sont incorrectes!'})
    db.query("INSERT INTO project (pname, pdesc, authorID, catID) VALUES (?, ?, ?, ?);", [name, desc, iduser, 1], (error, result) => {
        if(error) {
            response.status(400).json({error: true, message: 'Erreur lors du rajout du projet!'});
            console.log('Error: '+error)
        } else {
            response.status(200).json({error: false, message: 'Projet rajouté avec succes!'})
        }
    })
}

// Editer un projet
exports.editProject = function(request, response) {
    //if(request.session.isConnected !== true) return response.status(400).json({error: true, message: 'Vous n\'êtes pas connecté!'})
    // const iduser = request.session.userID // Pour sécuriser, controler si l'user possède le projet avec l'id en question!
    const id = request.body.id
    const name = request.body.name
    const desc = request.body.desc
    const catID = request.body.category
    if (id === undefined || name === undefined || desc === undefined || catID === undefined) return response.status(400).json({error: true, message: 'Les paramètres fourni sont incorrectes! => '+[id, name, desc, catID].join(' - ')})
    db.query("UPDATE project SET pname = ?, pdesc = ?, catID = ? WHERE idproject = ?;", [name, desc, catID, id], (error, outerResult) => {
        if(error) {
            response.status(400).json({error: true, message: 'Erreur lors de la modification du projet: La categorie est introuvable!'});
        } else {
            response.status(200).json({error: false, message: 'Projet modifiée avec succes!'});
        }
    })
}

// Supprimer un projet
exports.deleteProject = function(request, response) {
    //if(request.session.isConnected !== true) return response.status(400).json({error: true, message: 'Vous n\'êtes pas connecté!'})
    // const iduser = request.session.userID // Pour sécuriser, controler si l'user possède le projet avec l'id en question!
    const projectID = parseInt(request.params.id)
    db.query("DELETE FROM task WHERE pid = ?;", projectID, (error, result) => {
        if(error) {
            response.status(400).json({error: true, message: 'Erreur lors de la suppression de la tâche!'});
            console.log('ERROR '+error);
        } else {
            db.query(" DELETE FROM project WHERE idproject = ?;", projectID, (error, outerResult) => {
                if(error) {
                    response.status(400).json({error: true, message: 'Erreur lors de la suppression de la tâche!'});
                    console.log('ERROR '+error);
                } else {
                    response.status(200).json({error: false, message: 'Suppression reussi!!!'});
                }
            })
        }
    })
}

// Rajouter une tâche
exports.addTask = function(request, response) {
    //if(request.session.isConnected !== true) return response.status(400).json({error: true, message: 'Vous n\'êtes pas connecté!'})
    // const iduser = request.session.userID // Pour sécuriser, controler si l'user possède le projet avec l'id en question!
    const projectID = request.body.id
    const taskCategory = 1 // A chaque rajout de tâche, celui-ci est rajouté a la 1er categorie soit "Tâche en cours"!
    const name = request.body.name
    const desc = request.body.desc
    if (name === undefined || desc === undefined || projectID === undefined) return response.status(400).json({error: true, message: 'Les paramètres fourni sont incorrectes!'})
    db.query("INSERT INTO task (taskname, taskdesc, pid, tcatid) VALUES (?, ?, ?, ?);", [name, desc, projectID, taskCategory], (error, resultat) => {
        if(error) {
            response.status(400).json({error: true, message: 'Erreur lors de l\'ajout de la tâche!'});
        } else {
            response.status(200).json({error: false, message: 'Tâche rajouté avec succes!'});
        }
    })
}

//Supprimer une tâche
exports.deleteTask = function(request, response) {
    //if(request.session.isConnected !== true) return response.status(400).json({error: true, message: 'Vous n\'êtes pas connecté!'})
    // const iduser = request.session.userID // Pour sécuriser, controler si l'user possède la tâche en le liant avec son projet!
    const taskID = request.params.id
    if (taskID === undefined) return response.status(400).json({error: true, message: 'Les paramètres fourni sont incorrectes!'})
    db.query("DELETE FROM task WHERE taskid = ?;", taskID, (error, result) => {
        if(error) {
            response.status(400).json({error: true, message: 'Erreur lors de la suppression de la tâche!'});
        } else {
            response.status(200).json({error: false, message: 'Tâche supprimé avec succes!'});
        }
    })
}

// Modifier une tâche
exports.editTask = function(request, response) {
    //if(request.session.isConnected !== true) return response.status(400).json({error: true, message: 'Vous n\'êtes pas connecté!'})
    // const iduser = request.session.userID // Pour sécuriser, controler si l'user possède le projet avec l'id en question!
    const taskid = request.body.id
    const name = request.body.name
    const desc = request.body.desc
    const catID = request.body.category

    if (taskid === undefined || name === undefined || desc === undefined || catID === undefined) return response.status(400).json({error: true, message: 'Les paramètres fourni sont incorrectes!'})
    db.query("UPDATE task SET taskname = ?, taskdesc = ?, tcatid = ? WHERE taskid = ?;", [name, desc, catID, taskid], (error, result) => {
        if(error) {
            response.status(400).json({error: true, message: 'Erreur lors de la modification de la tâche!'+error});
        } else {
            response.status(200).json({error: false, message: 'Modification effectué avec succes!'});
        }
    })
}