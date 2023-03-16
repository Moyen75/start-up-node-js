const router = require("express").Router();

router.use("/payments", require("./salary"));

module.exports = router;