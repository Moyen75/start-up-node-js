const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);


getConfig = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const config = await mongo.fetchOne(db, "table-config", { uid, orgId });
        res.status(200).json({ success: !!config, config });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

updateConfig = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const payload = req.body;
        const config = await mongo.updateOne(
            db,
            "table-config",
            { uid, orgId },
            payload
        );
        res.status(200).json({ success: !!config, config });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};



router.get("/config/tables/:orgId/:uid", getConfig);
router.put("/config/tables/:orgId/:uid", updateConfig);

module.exports = router;
