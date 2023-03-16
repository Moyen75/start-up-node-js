const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);


setAuditor = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const db = client.db("apolloHMS");
        const auditor = await mongo.insertOne(db, "auditors", req.body)
        res.status(200).json({ success: !!auditor, auditor });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};
getAuditor = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const auditor = await mongo.fetchOne(db, "auditors", { orgId, uid });
        delete auditor._id;
        res.status(200).json({ success: !!auditor, auditor });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
getAuditors = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, pagination, limit } = req.query;
        const db = client.db("apolloHMS");
        const auditors = await mongo.fetchMany(
            db,
            "auditors",
            { orgId },
            { _id: 0 },
            {},
            Number(limit) || 10,
            Number(pagination) || 0);
        const total = await mongo.documentCount(db, "auditors", { orgId })
        res.status(200).json({ success: !!auditors, auditors, total });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
updateAuditor = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const auditor = await mongo.updateOne(db, "auditors", { orgId, uid }, req.body);
        res.status(200).json({ success: !!auditor, auditor });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
deleteAuditor = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const auditor = await mongo.deleteData(db, "auditors", { orgId, uid }, req.body);
        res.status(200).json({ success: !!auditor, auditor });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}

router.post("/auditors", setAuditor)
router.get("/auditors/org/:orgId/:uid", getAuditor)
router.get("/auditors/org/all", getAuditors)
router.put("/auditors/org/:orgId/:uid", updateAuditor);
router.delete("/auditors/org/:orgId/:uid", deleteAuditor);

module.exports = router;