const { Router } = require("express");
const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../models/User");
const router = Router();

router.get("/", async (req, res) => {
  try {
    const users = await User.find({});

    const token = (expiresIn) =>
      jwt.sign({}, config.get("jwtSecret"), {
        expiresIn,
      });

    res.status(200).json({ token, users });
  } catch (e) {
    res.status(500).json({ message: "Something wrong...Try again" });
  }
});

router.patch("/block", async (req, res) => {
  try {
    const { usersId, currentId } = req.body;

    usersId.forEach(async (id) => {
      await User.updateOne({ id }, { $set: { status: "Blocked" } });
    });
    const users = await User.find({});

    const expiredToken = (expiresIn) =>
      jwt.sign({}, config.get("jwtSecret"), {
        expiresIn,
      });

    const token = usersId.includes(currentId) ? null : expiredToken("1h");

    res.json({ token });
  } catch (e) {
    res.status(500).json({ message: "Something wrong...Try again" });
  }
});

router.patch("/unblock", async (req, res) => {
  try {
    const { usersId } = req.body;

    usersId.forEach(async (id) => {
      await User.updateOne({ id }, { $set: { status: "Activated" } });
    });

    const users = await User.find({});

    const token = jwt.sign({}, config.get("jwtSecret"), {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (e) {
    res.status(500).json({ message: "Something wrong...Try again" });
  }
});

router.patch("/delete", async (req, res) => {
  try {
    const { usersId, currentId } = req.body;

    usersId.forEach(async (id) => {
      await User.remove({ id });
    });

    const expiredToken = (expiresIn) =>
      jwt.sign({}, config.get("jwtSecret"), {
        expiresIn,
      });

    const token = usersId.includes(currentId) ? null : expiredToken("1h");

    res.json({ token });
  } catch (e) {
    res.status(500).json({ message: "Something wrong...Try again" });
  }
});

module.exports = router;
