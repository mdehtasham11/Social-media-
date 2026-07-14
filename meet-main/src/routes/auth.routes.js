const express = require("express");
const multer = require("multer");
const { fileFilter, storage } = require("../storage/multer");
const {
  handleRegisterUser,
  handleLoginUser,
  handleLoginAdmin,
} = require("../controller/auth.controller");
const router = express.Router();

const upload = multer({
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
  storage,
});

router.route("/register").post(upload.single("profile"), handleRegisterUser);
router.route("/login").post(handleLoginUser);
router.route("/login-admin").post(handleLoginAdmin);

router.use((err, req, res, next) => {
 console.error(err.stack);
 res.status(err.statusCode || 500).json({
   success: false,
   message: err.message || 'Internal Server Error',
   statusCode: err.statusCode || 500,
 });
});

module.exports = router;
