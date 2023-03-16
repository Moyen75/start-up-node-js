const router = require("express").Router();

router.use("/indoors", require("./admissions"));
router.use("/indoors", require("./admission-invoices"));
router.use("/indoors", require("./payments"));
router.use("/indoors", require("./expenditures"));
router.use("/indoors", require("./due-collections"));

module.exports = router