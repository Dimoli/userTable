const { Router } = require("express");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../models/User");
const router = Router();

router.post(
  "/register",
  [
    check("email", "Incorrect email").isEmail(),
    check("password", "Minimal length of password >= 1 symbol").isLength({
      min: 1,
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: "Incorrect registration data",
        });
      }

      const { email, password } = req.body;

      const candidate = await User.findOne({ email });

      if (candidate) {
        return res.status(400).json({ message: "User already exsists" });
      }

      const currentTime = new Date().toLocaleString();
      const hashedPassword = await bcrypt.hash(password, 12);
      const lastUser =
        (await User.findOne().sort({ field: "asc", id: -1 })) || 0;

      const user = new User({
        email,
        password: hashedPassword,
        checkbox: false,
        id: lastUser.id + 1,
        name: email,
        registrationTime: currentTime,
        lastLoginTime: currentTime,
        status: "Activated",
      });
      console.log(lastUser);
      await user.save();
      console.log("user");

      res.status(201).json({ message: "User created" });
    } catch (e) {
      res.status(500).json({ message: "Something wrong...Try again" });
    }
  }
);

router.post(
  "/login",
  [
    check("email", "Incorrect email").normalizeEmail().isEmail(),
    check("password", "Minimal length of password >= 1 symbol").isLength({
      min: 1,
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: "Incorrect login data",
        });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json(message, "Incorrect password");
      }

      if (user.status === "Blocked") {
        return res.status(403).json(message, "Forbidden");
      }

      await User.updateOne(
        { email },
        { $set: { lastLoginTime: new Date().toLocaleString() } }
      );

      const updatedUser = await User.findOne({ email });
      const userId = updatedUser.id;

      const token = jwt.sign({}, config.get("jwtSecret"), {
        expiresIn: "1h",
      });

      res.json({ token, userId });
    } catch (e) {
      res.status(500).json({ message: "Something wrong...Try again" });
    }
  }
);

module.exports = router;
