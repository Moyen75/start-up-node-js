const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);
const { sendSMS } = require(`${root}/services/sms`)


createSms = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const db = client.db("apolloHMS");
        const { message, number } = req.body;
        const isSmsSend = await sendSMS(message, number);
        const payload = req.body;
        if (isSmsSend) payload.status = "success"
        const sms = await mongo.insertOne(db, "sms", payload);
        res.status(200).json({ success: !!sms, sms });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

getSms = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const query = { uid, orgId }
        const db = client.db("apolloHMS");
        const sms = await mongo.fetchOne(db, "sms", query);
        res.status(200).json({ success: !!sms, sms });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

getAllSms = async (req, res, next) => {
    const client = await mongoConnect();
    const { orgId, pagination, limit } = req.query;
    try {
        const db = client.db("apolloHMS");
        const smsList = await mongo.fetchMany(
            db,
            "sms",
            { orgId },
            {},
            {},
            Number(limit) || 10,
            Number(pagination) || 0
        );
        const total = await mongo.documentCount(db, "sms", { orgId });
        res.status(200).json({ success: !!smsList, smsList, total });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

updateSms = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const payload = req.body;
        const sms = await mongo.updateOne(db, "sms", { uid, orgId }, payload);
        res.status(200).json({ success: !!sms, sms });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

deleteSms = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const sms = await mongo.deleteData(db, "sms", {
            uid,
            orgId,
        });
        res.status(200).json({ success: !!sms, sms });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

router.post("/sms", createSms);
router.get("/sms/org/:orgId/:uid", getSms);
router.get("/sms/org", getAllSms);
router.put("/sms/org/:orgId/:uid", updateSms);
router.delete("/sms/org/:orgId/:uid", deleteSms);

module.exports = router;
