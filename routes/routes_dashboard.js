let express = require('express');
let router = express.Router({strict: true});
let dashboard_controller = require('../controllers/dashboard_controller')

// Dashboard
router.get('/', dashboard_controller.showRegisterPage); // Racine, pour afficher tout les projet
router.get('/project/:pid/', dashboard_controller.showTaskCategories) // Afficher les categories d'un projet
router.get('/project/:pid/tasks/:cat/', dashboard_controller.showTasks) // Afficher les tâche d'une categories d'un projet
router.get('/project/:pid/tasks/:cat/task/:taskid/', dashboard_controller.showTask) // Afficher une tâche d'une projet
router.get('/taskmove/:project/:taskid/:ncategory/', dashboard_controller.taskMove) // Déplacer une tâche vers une autre catégorie
router.get('/projectmove/:project/:ncategory/', dashboard_controller.projectMove) // Déplacer un projet vers une autre catégorie

// Rajouter un projet
router.get('/addProject', dashboard_controller.addProject)
router.post('/addProject', dashboard_controller.postProject)

//Rajouter une tâche
router.get('/addTask/:idproject', dashboard_controller.addTask)
router.post('/addTask/:idproject', dashboard_controller.postTask)

// Modifier un projet
router.get('/editProject/:pid', dashboard_controller.editProject)
router.post('/editProject/:pid', dashboard_controller.postEditProject)

// Modifier une tâche
router.get('/editTask/:pid/:tid', dashboard_controller.editTask)
router.post('/editTask/:pid/:tid', dashboard_controller.postEditTask)


module.exports = router