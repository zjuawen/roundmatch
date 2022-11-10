/**
 * Created by Christos Ploutarchou
 * Project : node_rest_api_with_mysql
 * Filename : routes.js
 * Date: 05/04/2020
 * Time: 01:45
 **/
const dummy = require("../controllers/dummy");

// const admin = require("../controllers/Adminuser");
// const doctor = require("../controllers/Doctor");
// const patient = require("../controllers/Patient");
// const data = require("../controllers/Data");
// const dict = require("../controllers/Dict");
// const oss = require("../controllers/Oss");

// const wechat = require("../controllers/WechatApi");

const express = require("express");
const router = express.Router();

// debug
// router.post("/api/test", dummy.test);
router.get("/api/test", dummy.test);

// // admin users
// router.post("/api/admin/login", admin.login);
// router.get("/api/admin/logout", admin.logout);
// router.post("/api/admin/create", admin.create);
// router.get("/api/admin/list", admin.listUser);
// router.post("/api/admin/update", admin.update);
// router.get("/api/admin/current", admin.getCurrent);

// // Doctors
// // router.post("/api/doctor/login", doctor.login);
// router.post("/api/doctor/create", doctor.create);
// router.post("/api/doctor/bind", doctor.bind);
// router.post("/api/doctor/update", doctor.update);
// router.post("/api/doctor/detail", doctor.getDoctorByID);
// router.get("/api/doctor/list", doctor.listDoctors);
// router.post("/api/doctor/bindQrcode", doctor.getBindQrcode);
// router.post("/api/doctor/inviteQrcode", doctor.getInviteQrcode);
// // router.post("/api/doctor/saveData", doctor.saveData);
// router.get("/api/doctor/current", doctor.getCurrent);

// // patient
// router.post("/api/patient/create", patient.create);
// router.post("/api/patient/update", patient.update);
// router.get("/api/patient/list", patient.listPatients);
// router.get("/api/patient/current", patient.getCurrent);
// router.post("/api/patient/urge", wechat.urge);

// // data record
// router.post("/api/data/save", data.saveData);
// router.post("/api/data/update", data.update);
// router.get("/api/data/list", data.listData);
// router.get("/api/data/detail", data.load);
// router.get("/api/data/back", data.goback);
// router.post("/api/data/stat", data.statistics);
// router.get("/api/data/stageData", data.getStageData);
// router.get("/api/data/exportStageData", data.exportStageData);

// // utils
// router.post("/api/user/login", wechat.login);
// router.post("/api/oss/upload", oss.upload);
// router.get("/api/oss/get", oss.getUrl);
// router.get("/api/dict", dict.read);
// router.post("/api/oss/urltopdf", oss.saveUrlToPDF);


module.exports = router;
