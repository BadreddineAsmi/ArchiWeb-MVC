const express = require('express')
const router = express.Router()
const api = require('../controllers/api_controller')

// Authentification API
router.post('/login', api.loginUser)
router.get('/logout', api.logoutUser)
router.post('/register', api.registerUser)

// Application API 
router.get('/project', api.getProjects) // Demander les projets
router.post('/project', api.addProject) // Rajouter un projet
router.put('/project', api.editProject) // Modifier un projet
router.delete('/project/:id', api.deleteProject) // Supprimer un projet

router.post('/task', api.addTask) // Rajouter une tâche
router.put('/task', api.editTask) // Modifier une tâche
router.delete('/task/:id', api.deleteTask) // Supprimer une tâche


module.exports = router