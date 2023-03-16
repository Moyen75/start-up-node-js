const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);


setCtScan = async (req, res, next) => {
    const client = await mongoConnect();
    try {

        const db = client.db("apolloHMS");
        const ctScan = await mongo.insertOne(db, "ct-scans", req.body);
        res.status(200).json({ success: !!ctScan, ctScan });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};
getCtScan = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const ctScan = await mongo.fetchOne(db, "ct-scans", { orgId, uid });
        delete ctScan._id;
        res.status(200).json({ success: !!ctScan, ctScan });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
getCtScans = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, pagination, limit } = req.query;
        const db = client.db("apolloHMS");
        const ctScan = await mongo.fetchMany(
            db,
            "ct-scans",
            { orgId },
            { _id: 0 },
            {},
            Number(limit) || 10,
            Number(pagination) || 0);
        const total = await mongo.documentCount(db, "ct-scans", { orgId })
        res.status(200).json({ success: !!ctScan, ctScan, total });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
updateCtScan = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const ctScan = await mongo.updateOne(db, "ct-scans", { orgId, uid }, req.body);
        res.status(200).json({ success: !!ctScan, ctScan });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
deleteCtScan = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const ctScan = await mongo.deleteData(db, "ct-scans", { orgId, uid }, req.body);
        res.status(200).json({ success: !!ctScan, ctScan });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}

router.post("/ct-scan", setCtScan)
router.get("/ct-scan/org", getCtScans)
router.get("/ct-scan/org/:orgId/:uid", getCtScan)
router.put("/ct-scan/org/:orgId/:uid", updateCtScan);
router.delete("/ct-scan/org/:orgId/:uid", deleteCtScan);

module.exports = router;