const router = require("express").Router();

router.use("/pharmacy", require("./medicine"));
router.use("/pharmacy", require("./product"));
router.use("/pharmacy", require("./medicine-purchase"));
router.use("/pharmacy", require("./medicine-sales"));







module.exports = router;