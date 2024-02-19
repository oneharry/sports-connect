const express = require("express");
const {
  registerUser,
  loginUser
} = require("../controllers/user.controller");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/verify", (req, res) => {
  res.json({Status: "VERIFIED"});
})

module.exports = router;