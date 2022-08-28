const router = require("express").Router();
router.route("/").get((req, res) => {
  res.send("server is running");
});

module.exports = { router };
