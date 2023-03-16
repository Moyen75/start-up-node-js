const router = require("express").Router();

router.use("/payments", require("./operations"));

module.exports = router;