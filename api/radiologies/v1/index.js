const router = require("express").Router();
router.use("/radiologies", require("./angiogram"))
router.use("/radiologies", require("./ct-scan"))
router.use("/radiologies", require("./echo-cardiogram"))
router.use("/radiologies", require("./mri"))
router.use("/radiologies", require("./usg"))
router.use("/radiologies", require("./x-ray"))

module.exports = router;