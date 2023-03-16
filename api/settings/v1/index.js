const router = require("express").Router();

router.use("/settings", require("./beds"));
router.use("/settings", require("./departments"));
router.use("/settings", require("./operation-category"));
router.use("/settings", require("./operations"));
router.use("/settings", require("./specialists"));
router.use("/settings", require("./designations"));
router.use("/settings", require("./expenses"));
router.use("/settings", require("./lab-products"));
router.use("/settings", require("./references"));
router.use("/settings", require("./income-heads"));
router.use("/settings", require("./theatres"));
router.use("/settings", require("./suppliers"));
router.use("/settings", require("./accessories"));
router.use("/settings", require("./anesthesia"));
router.use("/settings", require("./degrees"));


module.exports = router;
