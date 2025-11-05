const userController=require("../Controllers/userController");
const reminderAlertsController=require("../Controllers/reminderAlertsController");
const express=require("express");
const router=express.Router();
const multer = require('multer');
// const path = require('path');
const reportController = require('../Controllers/reportController');
const auth = require('../Middleware/auth')
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

router.post("/registration",userController.registration);
router.post("/login",userController.login);
router.post("/edituser",auth.authentication,userController.editProfile);
router.get("/getminormembers",auth.authentication,userController.getMinorMembersList);
router.post("/addminor",auth.authentication,userController.addMinor);
router.put("/deleteuser",auth.authentication,userController.deleteUser);
router.post("/addalerts",auth.authentication,reminderAlertsController.addReminderAlert);
router.put("/editalert",auth.authentication,reminderAlertsController.editAlert);
router.get("/getalerts",auth.authentication,reminderAlertsController.getAlertList);
router.put("/deletealert",auth.authentication,reminderAlertsController.deleteAlert);
router.get("/getreports",auth.authentication,reportController.getDocuments);
router.put("/deletereport",auth.authentication,reportController.deleteDocument);
router.post("/uploadreport",auth.authentication,upload.single('file'),reportController.uploadDocument);
router.get("/downloadreport",auth.authentication,reportController.downloadDocument);
router.put("/editreport",auth.authentication,upload.single('file'),reportController.editDocument);
// Routes
// router.post('/upload', upload.single('file'), reportController.uploadDocument);
// router.get('/', reportController.getDocuments);
// router.get('/:id/download', reportController.downloadDocument);
// router.delete('/:id', reportController.deleteDocument);

module.exports=router