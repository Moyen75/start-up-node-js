const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);


createAnesthesia = async (req, res, next) => {
    const client = await mongoConnect();
    try {

        const db = client.db("apolloHMS");
        const payload = req.body;
        const anesthesia = await mongo.insertOne(db, "anesthesia-settings", req.body);
        res.status(200).json({ success: !!anesthesia, anesthesia });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};


getAnesthesia = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const anesthesia = await mongo.fetchOne(db, "anesthesia-settings", { uid, orgId });
        res.status(200).json({ success: !!anesthesia, anesthesia });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

updateAnesthesia = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const payload = req.body;

        const anesthesia = await mongo.updateOne(
            db,
            "anesthesia-settings",
            { uid, orgId },
            payload
        );
        res.status(200).json({ success: !!anesthesia, anesthesia });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

deleteAnesthesia = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const anesthesia = await mongo.deleteData(db, "anesthesia-settings", {
            uid,
            orgId,
        });
        res.status(200).json({ success: !!anesthesia, anesthesia });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

router.post("/anesthesia-settings", createAnesthesia);
router.get("/anesthesia-settings/org/:orgId/:uid", getAnesthesia);
router.put("/anesthesia-settings/org/:orgId/:uid", updateAnesthesia);
router.delete("/anesthesia-settings/org/:orgId/:uid", deleteAnesthesia);

module.exports = router;
