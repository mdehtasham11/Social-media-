const express = require("express");
const multer = require("multer");
const { storage } = require("../storage/multer");
const {
  handleRegisterUser,
  handleLoginUser,
} = require("../controller/auth.controller");
const router = express.Router();

const upload = multer({ storage: storage });

router.route("/register").post(upload.single("profile"), handleRegisterUser);
router.route("/login").post(handleLoginUser);

router.use((err, req, res, next) => {
 console.error(err.stack);
 res.status(err.statusCode || 500).json({
   message: err.message || 'Internal Server Error',
 });
});

module.exports = router;
