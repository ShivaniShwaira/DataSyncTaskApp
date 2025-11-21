const userController=require("../Controllers/userController");
const reminderAlertsController=require("../Controllers/reminderAlertsController");
const express=require("express");
const router=express.Router();
const multer = require('multer');
// const path = require('path');
const reportController = require('../Controllers/reportController');
const auth = require('../Middleware/auth')
const path = require("path");
const fs = require("fs");

const uploadPath = path.join(__dirname, "../uploads");

// Create uploads folder if missing
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log("Uploads folder created at runtime");
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

router.post("/registration",userController.registration);
router.post("/login",userController.login);
router.post("/edituser",auth.authentication,userController.editProfile);
router.get("/getminormembers",auth.authentication,userController.getMinorMembersList);
router.get("/getuserprofile",auth.authentication,userController.getProfile);
router.post("/addminor",auth.authentication,userController.addMinor);
router.put("/deleteuser",auth.authentication,userController.deleteUser);
router.put("/logout",auth.authentication,userController.logout);
router.post("/addalerts",auth.authentication,reminderAlertsController.addReminderAlert);
router.put("/editalert",auth.authentication,reminderAlertsController.editAlert);
router.get("/getalerts",auth.authentication,reminderAlertsController.getAlertList);
router.put("/deletealert",auth.authentication,reminderAlertsController.deleteAlert);
router.get("/getalertbyid",auth.authentication,reminderAlertsController.getAlertDetails);
router.get("/getreports",auth.authentication,reportController.getDocuments);
router.put("/deletereport",auth.authentication,reportController.deleteDocument);
router.post("/uploadreport",auth.authentication,upload.single('file'),reportController.uploadDocument);
router.get("/downloadreport",auth.authentication,reportController.downloadDocument);
router.put("/editreport",auth.authentication,upload.single('file'),reportController.editDocument);
router.put("/getreportbyid",auth.authentication,reportController.getDocumentById);
// Routes
// router.post('/upload', upload.single('file'), reportController.uploadDocument);
// router.get('/', reportController.getDocuments);
// router.get('/:id/download', reportController.downloadDocument);
// router.delete('/:id', reportController.deleteDocument);

module.exports=router