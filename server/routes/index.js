/**
 * Created by Christos Ploutarchou
 * Project : node_rest_api_with_mysql
 * Filename : routes.js
 * Date: 05/04/2020
 * Time: 01:45
 **/
const dummy = require("../controllers/dummy");
const clubs = require("../controllers/clubservice")
const users = require("../controllers/userservice")

// const wechat = require("../controllers/WechatApi");

const express = require("express");
const router = express.Router();

// debug
// router.post("/api/test", dummy.test);
router.get("/api/test", dummy.test);
// router.get("/api/test", clubs.main);

// club services
router.get("/api/clubservice", clubs.main);

// user services
router.get("/api/userservice", users.main);



module.exports = router;
