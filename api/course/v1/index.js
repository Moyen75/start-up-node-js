const router = require("express").Router();
const root = require("app-root-path");

const authRoute = require(`${root}/middleware/authenticate`)

const mongo = require(`${root}/services/mongo-crud`);


getCourseData = async (req, res, next) => {
    try {
        const person = await mongo.fetchMany("course");
        return res.status(200).json({ success: true, person });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

router.get("/course", getCourseData);

module.exports = router;