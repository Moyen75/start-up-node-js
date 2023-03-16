const router = require("express").Router();

router.use("/accounts", require("./expenses"));
router.use("/accounts", require("./payments"));
router.use("/accounts", require("./incomes"));
router.use("/accounts", require("./account"));
router.use("/accounts", require("./balances"));

module.exports = router;