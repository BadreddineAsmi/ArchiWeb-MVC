const db = require('../db')

class informationManager {
    constructor(db, iduser) {
        this.db = db
        this.iduser = iduser
    }

    getInformations(fun){
        this.db.query("SELECT idcategory, catname as pcategory, idproject, pname as projectname, pdesc, idtaskcategory as idtaskcat, TaskCatName as tcategory, taskid as idtask, taskname, taskdesc FROM category LEFT JOIN (SELECT * FROM project JOIN taskcategory LEFT JOIN task ON tcatid = idtaskCategory and pid = idproject WHERE project.authorID = ? ORDER BY idtaskCategory) AS p ON catID = idcategory;", this.iduser, (error, result) => {
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
        this.db.query("select * from task where taskid = ? and pid = ?;", [tid, pid], (error, result) => {
            if(error || result.length < 1 || result.length > 1){
                fun()
            } else {
                const task = {'id': result[0].taskid, 'name': result[0].taskname, 'description': result[0].taskdesc}
                fun(task)
            }
         })
    }

    moveTask(taskid, newCatID, fun){
        this.db.query("UPDATE task SET tcatid = ? WHERE taskid = ?;", [newCatID, taskid], (error, result) => { fun(error) })
    }

    moveProject(projectid, newCatID, fun){
        this.db.query("UPDATE project SET catID = ? WHERE idproject = ?;", [newCatID, projectid], (error, result) => { fun(error) })
    }

    deleteTask(taskid, fun){
        this.db.query("DELETE FROM task WHERE taskid = ?;", taskid, (error, result) => { fun(error) })
    }

    // On supprime toutes les tâches corréspondente aussi!
    deleteProject(projectid, fun){
        this.db.query("DELETE FROM task WHERE pid = ?;", projectid, (outerError, result) => { this.db.query(" DELETE FROM project WHERE idproject = ?;", projectid, (innerError, res) => { fun(outerError, innerError) })})
    }

    createProject(name, desc, fun){
        this.db.query("INSERT INTO project (pname, pdesc, authorID, catID) VALUES (?, ?, ?, ?);", [name, desc, this.iduser, 1], (error, result) => { fun(error)})
    }

    createTask(name, desc, pid, fun){
        this.db.query("INSERT INTO task (taskname, taskdesc, pid, tcatid) VALUES (?, ?, ?, ?);", [name, desc, pid, 1], (error, result) => { fun(error)})
    }

    updateProject(name, desc, pid, fun){
        this.db.query("UPDATE project SET pname = ?, pdesc = ? WHERE idproject = ?;", [name, desc, pid], (error, result) => { fun(error)})
    }

    updateTask(pid, tid, name, desc, fun){
        this.db.query("UPDATE task SET taskname = ?, taskdesc = ? WHERE taskid = ? and pid = ?;;", [name, desc, tid, pid], (error, result) => { fun(error)})
    }
}

module.exports = informationManager;