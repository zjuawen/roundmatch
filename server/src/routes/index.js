/**
 * API Routes
 * Project : roundmatch
 * Filename : routes.js
 **/

const express = require("express")
const router = express.Router()
const multer = require('multer')

// Controllers
const dummy = require("../controllers/dummy")
const clubs = require("../controllers/clubservice")
const users = require("../controllers/userservice")
const matches = require("../controllers/matchservice")
const games = require("../controllers/gameservice")
const system = require("../controllers/systemservice")
const media = require("../controllers/mediaservice")

// Debug route
router.get("/api/test", dummy.test)

// Club services
router.get("/api/clubservice", clubs.main)

// User services
router.get("/api/userservice", users.main)

// Match services
router.get("/api/matchservice", matches.main)

// System services
router.get("/api/systemservice", system.main)

// Game services
router.get("/api/gameService", games.main)

// Media services
const upload = multer({ dest: "../uploads/tmp/" })
router.post("/api/mediaService", upload.single('file'), media.main)

module.exports = router

