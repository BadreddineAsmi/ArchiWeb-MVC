const db = require('../db')

class informationManager {
    constructor(request) {
        this.iduser = request.session.userID
        this.request = request
        this.isconnected = request.session.isConnected
    }

    getInformations(fun){
        db.query("SELECT idcategory, catname as pcategory, idproject, pname as projectname, pdesc, idtaskcategory as idtaskcat, TaskCatName as tcategory, taskid as idtask, taskname, taskdesc FROM category LEFT JOIN (SELECT * FROM project JOIN taskcategory LEFT JOIN task ON tcatid = idtaskCategory and pid = idproject WHERE project.authorID = ? ORDER BY idtaskCategory) AS p ON catID = idcategory;", this.iduser, (error, result) => {
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
                fun(organizedQuery)
            }
        })
    }
    getProject(id, fun){
        this.getInformations((organizedQuery) => {
            let result = undefined
            let category = undefined
            for(let i = 0; i<organizedQuery.length; i++){
                const project = organizedQuery[i].projects.find(project => project.id === parseInt(id))
                if(project !== undefined){
                    result = project
                    category = parseInt(organizedQuery[i].catid)
                }
            }
            fun(result, category)
        })
    }

    getTask(pid, tid, fun){
        db.query("select * from task where taskid = ? and pid = ?;", [tid, pid], (error, result) => {
            if(error || result.length < 1 || result.length > 1){
                fun()
            } else {
                const task = {'id': result[0].taskid, 'name': result[0].taskname, 'description': result[0].taskdesc}
                fun(task)
            }
         })
    }

    moveTask(taskid, newCatID, fun){
        db.query("UPDATE task SET tcatid = ? WHERE taskid = ?;", [newCatID, taskid], (error) => { fun(error) })
    }

    moveProject(projectid, newCatID, fun){
        db.query("UPDATE project SET catID = ? WHERE idproject = ?;", [newCatID, projectid], (error) => { fun(error) })
    }

    deleteTask(taskid, fun){
        db.query("DELETE FROM task WHERE taskid = ?;", taskid, (error) => { fun(error) })
    }

    // On supprime toutes les tâches corréspondente aussi!
    deleteProject(projectid, fun){
        db.query("DELETE FROM task WHERE pid = ?;", projectid, (outerError) => { db.query(" DELETE FROM project WHERE idproject = ?;", projectid, (innerError) => { fun(outerError, innerError) })})
    }

    createProject(name, desc, fun){
        db.query("INSERT INTO project (pname, pdesc, authorID, catID) VALUES (?, ?, ?, ?);", [name, desc, this.iduser, 1], (error) => { fun(error)})
    }

    createTask(name, desc, pid, fun){
        db.query("INSERT INTO task (taskname, taskdesc, pid, tcatid) VALUES (?, ?, ?, ?);", [name, desc, pid, 1], (error) => { fun(error)})
    }

    updateProject(name, desc, pid, fun){
        db.query("UPDATE project SET pname = ?, pdesc = ? WHERE idproject = ?;", [name, desc, pid], (error) => { fun(error)})
    }

    updateTask(pid, tid, name, desc, fun){
        db.query("UPDATE task SET taskname = ?, taskdesc = ? WHERE taskid = ? and pid = ?;;", [name, desc, tid, pid], (error) => { fun(error)})
    }

    // Information for the API
    api_login(username, password, request, fun){
        if(username === undefined || password === undefined) return fun(null, false, {error: true, message: 'Les paramètres fourni sont incorrectes!'})
        db.query("SELECT iduser, username, password FROM user WHERE username=?;", username, (error, result) => {
            if(error) {
                fun(error, false, {error: true, message: 'Une erreur s\'est produite lors de la connexion!'})
            }
            if(result.length > 0) { // On controle si le resultat n'est pas vide!
                if(result[0].username === username && result[0].password === password){
                    this.iduser = result[0].iduser
                    request.session.isConnected = true;
                    request.session.userID = this.iduser
                    fun(error, true, {error: false, message: 'Connecté avec succes!'}, result[0].iduser)
                } else {
                    fun(error, false, {error: true, message: 'Nom d\'utilisateur ou mot de passe incorrecte!'})
                }
            } else {
                fun(error, false, {error: true, message: 'Nom d\'utilisateur ou mot de passe incorrecte!'})
            }
        })
    }

    api_alreadyconnected(){
        return {error: true, message: 'Vous êtes déjà connecté!'}
    }

    api_checksession(fun){
        if(this.isconnected){
            fun(true)
        } else {
            fun(false, {error: true, message: 'Vous n\'êtes pas connecté!'})
        }
    }

    api_disconnect(fun){
        this.request.session.destroy();
        fun({error: false, message: 'Vous vous êtes déconnecté avec succes!'})
    }

    api_register(name, lastname, email, username, password, fun){
        if(name === undefined || lastname === undefined || username === undefined || email === undefined || password === undefined) return fun({error: true, message: 'Les paramètres fourni sont incorrectes!'})
        db.query("INSERT INTO user (username, password, email, name, lastname) VALUES (?, ?, ?, ?, ?);", [username, password, email, name, lastname], (error) => {
            fun(error, {error: true, message: 'Une erreur s\'est produite lors de l\'ajout d\'un utilisateur!'}, {error: false, message: 'Vous avez été enregistré avec succes!'})
        })
    }


    api_getProject(fun){
        db.query("SELECT idcategory, catname as pcategory, idproject, pname as projectname, pdesc, idtaskcategory as idtaskcat, TaskCatName as tcategory, taskid as idtask, taskname, taskdesc FROM category LEFT JOIN (SELECT * FROM project JOIN taskcategory LEFT JOIN task ON tcatid = idtaskCategory and pid = idproject WHERE project.authorID = ? ORDER BY idtaskCategory) AS p ON catID = idcategory;", this.iduser, (error, result) => {
            if(error) {
                return fun(error, {error: true, message: 'Erreur, impossible de récuperer les projets!'})
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
                return fun(error, undefined, organizedQuery)
            }
        })
    }

    api_addProject(name, desc, fun){
        if (name === undefined || desc === undefined) return fun(true, {error: true, message: 'Les paramètres fourni sont incorrectes!'})
        db.query("INSERT INTO project (pname, pdesc, authorID, catID) VALUES (?, ?, ?, ?);", [name, desc, this.iduser, 1], (error) => {
            if(error) {
                fun(error, {error: true, message: 'Erreur lors du rajout du projet!'})
            } else {
                fun(error, {error: false, message: 'Projet rajouté avec succes!'})
            }
        })
    }

    api_editProject(id, name, desc, catID, fun){
        if (id === undefined || name === undefined || desc === undefined || catID === undefined) return fun(true, {error: true, message: 'Les paramètres fourni sont incorrectes!'})
        db.query("UPDATE project SET pname = ?, pdesc = ?, catID = ? WHERE idproject = ?;", [name, desc, catID, id], (error) => {
            if(error) {
                fun(error, {error: true, message: 'Erreur lors de la modification du projet!'});
            } else {
                fun(error, {error: false, message: 'Projet modifiée avec succes!'});
            }
        })
    }

    // Lors de la supression d'un projet, toutes ses tâches affiliée sont aussi supprimée!
    api_deleteProject(projectID, fun){
        if (projectID === undefined) return fun(true, {error: true, message: 'Les paramètres fourni sont incorrectes!'})
        db.query("DELETE FROM task WHERE pid = ?;", projectID, (outerError) => {
            if(outerError) {
                fun(outerError, {error: true, message: 'Erreur lors de la suppression des tâches!'});
            } else {
                db.query(" DELETE FROM project WHERE idproject = ?;", projectID, (error) => {
                    if(error) {
                        fun(error, {error: true, message: 'Erreur lors de la suppression du projet!'});
                    } else {
                        fun(error, {error: false, message: 'Suppression reussi!'});
                    }
                })
            }
        })
    }

    api_addTask(name, desc, projectID, fun){
        if (name === undefined || desc === undefined || projectID === undefined) return fun(true, {error: true, message: 'Les paramètres fourni sont incorrectes!'})
        const taskCategory = 1 // A chaque rajout de tâche, celui-ci est rajouté a la 1er categorie soit "Tâche en cours"!
        db.query("INSERT INTO task (taskname, taskdesc, pid, tcatid) VALUES (?, ?, ?, ?);", [name, desc, projectID, taskCategory], (error) => {
            if(error) {
                fun(error, {error: true, message: 'Erreur lors de l\'ajout de la tâche!'});
            } else {
                fun(error, {error: false, message: 'Tâche rajouté avec succes!'});
            }
        })
    }

    api_deleteTask(taskID, fun){
        if (taskID === undefined) return fun(true, {error: true, message: 'Les paramètres fourni sont incorrectes!'})
        db.query("DELETE FROM task WHERE taskid = ?;", taskID, (error) => {
            if(error) {
                fun(error, {error: true, message: 'Erreur lors de la suppression de la tâche!'});
            } else {
                fun(error, {error: false, message: 'Tâche supprimé avec succes!'});
            }
        })
    }

    api_editTask(taskid, name, desc, catID, fun){
        if (taskid === undefined || name === undefined || desc === undefined || catID === undefined) return fun(true, {error: true, message: 'Les paramètres fourni sont incorrectes!'})
        db.query("UPDATE task SET taskname = ?, taskdesc = ?, tcatid = ? WHERE taskid = ?;", [name, desc, catID, taskid], (error, result) => {
            if(error) {
                fun(error, {error: true, message: 'Erreur lors de la modification de la tâche!'+error});
            } else {
                fun(error, {error: false, message: 'Modification effectué avec succes!'});
            }
        })
    }
}

module.exports = informationManager;