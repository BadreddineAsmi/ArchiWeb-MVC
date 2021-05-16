const express = require('express')
const router = express.Router()
const api = require('../controllers/api_controller')

// Authentification API
router.post('/login', api.loginUser)
router.get('/logout', api.checksession, api.logoutUser)
router.post('/register', api.registerUser)

// Application API 
router.get('/project', api.checksession, api.getProjects) // Demander les projets
router.post('/project', api.checksession, api.addProject) // Rajouter un projet
router.put('/project', api.checksession, api.editProject) // Modifier un projet
router.delete('/project/:id', api.checksession, api.deleteProject) // Supprimer un projet

router.post('/task', api.checksession, api.addTask) // Rajouter une tâche
router.put('/task', api.checksession, api.editTask) // Modifier une tâche
router.delete('/task/:id', api.checksession, api.deleteTask) // Supprimer une tâche


module.exports = router