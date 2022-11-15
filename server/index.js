const express = require("express");
const session = require('express-session');
const bodyParser = require("body-parser");
const fileupload = require("express-fileupload");
const cors = require("cors");
const server = express();
const db = require("./models");
const utils = require("./utils/json.importer");

const corsSettings = {
	origin: true,
	// origin: ["https://roundmatch.microripples.cn", "https://medical.tattoosoft.cn:8443", "http://localhost:8080"],
	credentials: true,
};

const sessionSettings = {
	secret: 'roundmatch token',
	resave: true,
	rolling: true,
	saveUninitialized: false,
	name: 'token',
	cookie: { 
		maxAge: 60*60000,	// 60 mins
		// secure: true,
		// proxy : true
		// sameSite: 'None',
	}	
};

const api = require("./routes/index");

server.use(cors(corsSettings));
server.use(session(sessionSettings));
// Parse request of content-type - application/json
server.use(bodyParser.json());
// parse requests of content-type -application/x-www-form-urlencoded
server.use(bodyParser.urlencoded({ extended: true }));
// parse file uploader
server.use(fileupload());

server.use("/", api);
// set listening ports for request
const port = process.env.PORT || 8300;

server.listen(port, () => {
  console.log(`Server running on port : ${port} on ${new Date()}`);
});

// Run following function if you want drop existing tables and re-sync database
// db.dropRestApiTable();

db.databaseConf.sync();

// Run following function if you want import all data 
// utils.process('./exported/', 'clubs');
// utils.process('./exported/', 'players');
// utils.process('./exported/', 'users');










