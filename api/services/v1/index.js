const router = require("express").Router();

router.use("/services", require("./emergencies"));
router.use("/services", require("./dressings"));
router.use("/services", require("./bloods"));
router.use("/services", require("./blood-donors"));
router.use("/services", require("./create-service"));
router.use("/services", require("./invoices"));







module.exports = router;