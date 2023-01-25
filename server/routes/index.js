/**
 * Created by Awen
 * Project : 
 * Filename : routes.js
 * Date: 20/11/2022
 * Time: 01:45
 **/
const dummy = require("../controllers/dummy")
const clubs = require("../controllers/clubservice")
const users = require("../controllers/userservice")
const matches = require("../controllers/matchservice")
const games = require("../controllers/gameservice")
const system = require("../controllers/systemservice")

// const wechat = require("../controllers/WechatApi")

const express = require("express")
const router = express.Router()

// debug
// router.post("/api/test", dummy.test)
router.get("/api/test", dummy.test)
// router.get("/api/test", clubs.main)

// club services
router.get("/api/clubservice", clubs.main)

// user services
router.get("/api/userservice", users.main)

// match services
router.get("/api/matchservice", matches.main)

// system services
router.get("/api/systemservice", system.main)

// system services
router.get("/api/gameService", games.main)

module.exports = router
