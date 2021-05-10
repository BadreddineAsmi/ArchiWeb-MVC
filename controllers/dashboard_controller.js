const im = require('../models/informationManager_model');
const db = require('../db')

exports.showRegisterPage = function(request, response) {
    const info = new im(db, 2) // Get dans le const iduser = request.session.userID 
    const list = info.getInformations(function(organizedQuery) {
        const inuse = organizedQuery.find(element => element.catid === 1)
        const canceled = organizedQuery.find(element => element.catid === 2)
        const finished = organizedQuery.find(element => element.catid === 3)
        response.render('projetpage.ejs', {
            'addprojectpagelink': '/addproject',
            'editprojectpagelink': '/editproject/',
            'logoutlink': '/logout',
            'inuse': inuse, 
            'canceled': canceled,
            'finished': finished
        });
    })
}

exports.showTaskCategories = async function(request, response) {
    // Recup le nombre de tâche pour le projet
    const projectID = request.params.pid
    const info = new im(db, 2)
    info.getProject(projectID, function(found, projectcat) {
        if(found !== undefined) {
            response.render('taskCategoryPage.ejs', 
            {'addprojectpagelink': `/addtask/${projectID}`,
            'logoutlink': '/logout',
            'category': true, 'projectname': found.name,
            'projectID': projectID,
            'projectcat': projectcat,
            'amount_inuse': found.tasks.find(el => el.catid == 1).tasks.length, 
            'amount_canceled': found.tasks.find(el => el.catid == 2).tasks.length, 
            'amount_finished': found.tasks.find(el => el.catid == 3).tasks.length})
        } else {
            response.redirect('/')
        }
    })
}

exports.showTasks = function(request, response) {
    const info = new im(db, 2)
    const projectID = request.params.pid
    const tcat = parseInt(request.params.cat)
    if(projectID !== undefined && tcat !== undefined){
        info.getProject(projectID, function(found, projectcat) {
            if(found !== undefined && found.tasks.map(el => el.catid).includes(tcat)) {
                response.render('taskCategoryPage.ejs', 
                {'addprojectpagelink': `/addtask/${projectID}`,
                'logoutlink': '/logout',
                'projectID': projectID,
                'category': false,
                'projectcat': projectcat,
                'projectname': found.name, 
                'tasks': found.tasks.find(el => el.catid === tcat).tasks })
            } else {
                response.redirect('/')
            }
        })
    } else {
        response.redirect('/')
    }
}


exports.showTask = function(request, response) {
    const info = new im(db, 2)
    const projectID = request.params.pid
    const tcat = parseInt(request.params.cat)
    const taskid = parseInt(request.params.taskid)
    if(projectID !== undefined && tcat !== undefined && taskid !== undefined){
        info.getProject(projectID, function(found, projectcat) {
            if(found !== undefined && found.tasks.map(el => el.catid).includes(tcat)) {
                const task = found.tasks.find(el => el.catid === tcat).tasks.find(el => el.id === taskid)
                response.render('taskShowPage.ejs', 
                                {'addprojectpagelink': '/addproject',
                                'logoutlink': '/logout', 
                                'projectname': found.name, 
                                'name': task.name, 
                                'desc': task.description,
                                'currentCat': tcat,
                                'projectcat': projectcat,
                                'linkToDelete': `/taskmove/${found.id}/${task.id}/${0}/`,
                                'linkToRetake': `/taskmove/${found.id}/${task.id}/${1}/`,  
                                'linkToCancel': `/taskmove/${found.id}/${task.id}/${2}/`, 
                                'linkToFinish': `/taskmove/${found.id}/${task.id}/${3}/`
                            })
            } else {
                response.redirect('/')
            }
        })
    } else {
        response.redirect('/')
    }
}

exports.taskMove = function(request, response) {
    const info = new im(db, 2)
    const projectID = parseInt(request.params.project)
    const taskID = parseInt(request.params.taskid)
    const ncategory = parseInt(request.params.ncategory)

    if(projectID !== undefined && taskID !== undefined && ncategory !== undefined){
        info.getProject(projectID, function(found) {
            if(found !== undefined){
                if(found.tasks.map(el => el.catid).includes(ncategory)){
                    info.moveTask(taskID, ncategory, (error) => {
                        if(error){
                            response.redirect('/')
                        } else {
                            response.redirect(`/project/${found.id}/`)
                        }
                    })
                } else {
                    info.deleteTask(taskID, (error) => {
                        if(error){
                            response.redirect('/')
                        } else {
                            response.redirect(`/project/${found.id}/`)
                        }
                    })
                }
            } else {
                response.redirect('/')
            }
        })
    }
}

exports.projectMove = function(request, response) {
    const info = new im(db, 2)
    const projectID = parseInt(request.params.project)
    const ncategory = parseInt(request.params.ncategory)

    if(projectID !== undefined && ncategory !== undefined){
        info.getProject(projectID, function(found) {
            if(found !== undefined){
                if(found.tasks.map(el => el.catid).includes(ncategory)){
                    info.moveProject(projectID, ncategory, (error) => { response.redirect('/') })
                } else {
                    info.deleteProject(projectID, (error) => { response.redirect('/') })
                }
            } else {
                response.redirect('/')
            }
        })
    }
}

exports.addProject = function(request, response) {
    const info = new im(db, 2)
    response.render('AddElementPage.ejs', 
    {'addprojectpagelink': '/addproject',
    'logoutlink': '/logout',
    'title': 'Creation d\'un nouveau projet',
    'firstlabel': 'Nom du projet',
    'secondlabel': 'Déscription du projet',
    'namefield': '',
    'descfield': '',
    'postlink': '/addproject'})
}

exports.postProject = function(request, response) {
    const info = new im(db, 2)
    const projectname = request.body.name
    const projectdesc = request.body.desc
    info.createProject(projectname, projectdesc, (error) => {
        response.redirect('/')
    })
}

exports.addTask = function(request, response) {
    const info = new im(db, 2)
    const projectID = parseInt(request.params.idproject)

    response.render('AddElementPage.ejs', 
    {'addprojectpagelink': '/addtask/'+projectID,
    'logoutlink': '/logout',
    'title': 'Creation d\'une nouvelle tâche',
    'firstlabel': 'Nom de la tâche',
    'secondlabel': 'Déscription de la tâche',
    'namefield': '',
    'descfield': '',
    'postlink': '/addtask/'+projectID})
}

exports.postTask = function(request, response) {
    const info = new im(db, 2)
    const projectID = parseInt(request.params.idproject)
    const taskname = request.body.name
    const taskdesc = request.body.desc
    if(projectID !== undefined){
        info.createTask(taskname, taskdesc, projectID, (error) => {
            response.redirect(`/project/${projectID}/`)
        })
    } else {
        response.redirect('/')
    }
}

exports.editProject = function(request, response) {
    const info = new im(db, 2)
    const projectID = parseInt(request.params.pid)

    if(projectID !== undefined){
        info.getProject(projectID, function(found) {
            if(found !== undefined){
                response.render('AddElementPage.ejs', 
                {'addprojectpagelink': '/addproject',
                'logoutlink': '/logout',
                'title': 'Modification d\'un projet',
                'firstlabel': 'Nouveau nom du projet',
                'secondlabel': 'Nouvelle déscription du projet',
                'namefield': found.name,
                'descfield': found.description,
                'postlink': '/editProject/'+projectID})
            } else {
                response.redirect('/')
            }
        })
    }
}

exports.postEditProject = function(request, response) {
    const info = new im(db, 2)
    const projectID = parseInt(request.params.pid)
    const newname = request.body.name
    const newdesc = request.body.desc

    if(projectID !== undefined){
        info.updateProject(newname, newdesc, projectID, (error) => {
            response.redirect('/')
        })
    }
}

exports.editTask = function(request, response) {
    const info = new im(db, 2)
    const projectID = parseInt(request.params.pid)
    const taskID = parseInt(request.params.tid)

    if(projectID !== undefined && taskID !== undefined){
        info.getTask(projectID, taskID, function(task) {
            if(task !== undefined){
                response.render('AddElementPage.ejs', 
                {'addprojectpagelink': '/editTask/'+projectID+'/'+taskID,
                'logoutlink': '/logout',
                'title': 'Modification d\'une tâche',
                'firstlabel': 'Nouveau nom de la tâche',
                'secondlabel': 'Nouvelle déscription de la tâche',
                'namefield': task.name,
                'descfield': task.description,
                'postlink': '/editTask/'+projectID+'/'+taskID})
            } else {
                response.redirect('/')
            }
        })
    }
}

exports.postEditTask = function(request, response) {
    const info = new im(db, 2)
    const projectID = parseInt(request.params.pid)
    const taskID = parseInt(request.params.tid)
    const newname = request.body.name
    const newdesc = request.body.desc

    if(projectID !== undefined && taskID !== undefined){
        info.updateTask(projectID, taskID, newname, newdesc, (error) => {
            response.redirect('/project/'+projectID+'/')
        })
    }
}