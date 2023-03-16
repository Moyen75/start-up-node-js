const router = require("express").Router();

router.use("/outdoors", require("./due-collections"))
router.use("/outdoors", require("./serials"))
router.use("/outdoors", require("./visits"))
router.use("/outdoors", require("./test-commission"))
router.use("/outdoors", require("./ultra"))
router.use("/outdoors", require("./tests-invoices"))
router.use("/outdoors", require("./payments"))

module.exports = router;