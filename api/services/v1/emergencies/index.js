const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);



setEmergency = async (req, res, next) => {
    const client = await mongoConnect();
    try {

        const db = client.db("apolloHMS");
        const emergency = await mongo.insertOne(db, "emergencies", req.body);
        res.status(200).json({ success: !!emergency, emergency });
    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};
getEmergency = async (req, res, next) => {
    const client = await mongoConnect();
    const { orgId, uid } = req.params;
    try {
        const db = client.db("apolloHMS");
        const emergency = await mongo.fetchOne(db, "emergencies", { orgId, uid });
        res.status(200).json({ success: !!emergency, emergency });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
getEmergencies = async (req, res, next) => {
    const client = await mongoConnect();
    const { orgId, pagination, limit } = req.query;
    try {
        const db = client.db("apolloHMS");
        const emergencies = await mongo.fetchMany(
            db,
            "emergencies",
            { orgId },
            {},
            {},
            Number(limit) || 10,
            Number(pagination) || 0
        );
        const total = await mongo.documentCount(db, "emergencies", { orgId });
        res.status(200).json({ success: !!emergencies, emergencies, total });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
updateEmergency = async (req, res, next) => {
    const client = await mongoConnect();
    const { orgId, uid } = req.params;
    try {
        const db = client.db("apolloHMS");
        const emergency = await mongo.updateOne(db, "emergencies", { orgId, uid }, req.body);
        res.status(200).json({ success: !!emergency, emergency });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};
deleteEmergency = async (req, res, next) => {
    const client = await mongoConnect();
    const { orgId, uid } = req.params;
    try {
        const db = client.db("apolloHMS");
        const emergency = await mongo.deleteData(db, "emergencies", { orgId, uid });
        res.status(200).json({ success: !!emergency, emergency });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};

router.post("/emergencies", setEmergency);
router.get("/emergencies/org/:orgId/:uid", getEmergency);
router.get("/emergencies/org/all", getEmergencies);
router.put("/emergencies/org/:orgId/:uid", updateEmergency);
router.delete("/emergencies/org/:orgId/:uid", deleteEmergency)

module.exports = router;