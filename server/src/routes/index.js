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
const admins = require("../controllers/adminservice")

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

// 检查头像 URL（管理台，需要认证）
router.get("/api/admin/media/check-avatar", admins.verifyToken, media.checkAvatar)

// ========== 管理台专用 RESTful API ==========

// 俱乐部管理 API（需要认证）
router.get("/api/admin/clubs", admins.verifyToken, clubs.listAll)
router.get("/api/admin/clubs/:id", admins.verifyToken, clubs.getById)
router.post("/api/admin/clubs", admins.verifyToken, clubs.create)
router.put("/api/admin/clubs/:id", admins.verifyToken, clubs.update)
router.delete("/api/admin/clubs/:id", admins.verifyToken, clubs.delete)

// 赛事管理 API（需要认证）
router.get("/api/admin/matches", admins.verifyToken, matches.listAll)
router.get("/api/admin/matches/:id", admins.verifyToken, matches.getById)
router.get("/api/admin/matches/:id/games", admins.verifyToken, matches.getGames)
router.post("/api/admin/matches", admins.verifyToken, matches.create)
router.put("/api/admin/matches/:id", admins.verifyToken, matches.update)
router.delete("/api/admin/matches/:id", admins.verifyToken, matches.delete)

// 用户管理 API（需要认证）
router.get("/api/admin/users", admins.verifyToken, users.listAll)
router.get("/api/admin/users/:id", admins.verifyToken, users.getById)

// ========== 管理员认证和管理 API ==========

// 管理员登录（不需要认证）
router.post("/api/admin/auth/login", admins.login)
router.post("/api/admin/auth/login/wechat", admins.loginByWechat)

// 获取当前登录管理员信息（需要认证）
router.get("/api/admin/auth/me", admins.verifyToken, admins.getCurrentAdmin)

// 管理员管理 API（需要超级管理员权限）
router.get("/api/admin/admins", admins.verifyToken, admins.verifySuperAdmin, admins.listAll)
router.post("/api/admin/admins", admins.verifyToken, admins.verifySuperAdmin, admins.create)
router.put("/api/admin/admins/:id", admins.verifyToken, admins.verifySuperAdmin, admins.update)
router.delete("/api/admin/admins/:id", admins.verifyToken, admins.verifySuperAdmin, admins.delete)

module.exports = router

