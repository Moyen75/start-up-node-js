const router = require("express").Router();

router.use("/pathologies", require("./results"));
router.use("/pathologies", require("./product-in"));
router.use("/pathologies", require("./product-out"));
router.use("/pathologies", require("./tests"));
router.use("/pathologies", require("./test-categories"));

module.exports = router;
