const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);

setService = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const db = client.db("apolloHMS");
        const service = await mongo.insertOne(db, "service", req.body);
        res.status(200).json({ success: !!service, service });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};
getservice = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const query = { orgId, uid }
        const service = await mongo.fetchOne(db, "service", query);
        res.status(200).json({ success: !!service, service });
    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
getgetservices = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, pagination, limit } = req.query;
        const db = client.db("apolloHMS");
        const query = { orgId }
        const service = await mongo.fetchWithAggregation(
            db,
            "service",
            query,
            {},
            { createdAt: 1 },
            Number(limit) || 10,
            Number(pagination) || 0
        );
        const total = await mongo.documentCount(db, "service", { orgId })
        res.status(200).json({ success: !!service, service, total });
    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
updateService = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const service = await mongo.updateOne(db, "service", { orgId, uid }, req.body);
        res.status(200).json({ success: !!service, service });
    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};
deleteService = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const service = await mongo.deleteData(db, "service", { orgId, uid });
        res.status(200).json({ success: !!service, service });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}

router.post("/service", setService);
router.get("/service/org/:orgId/:uid", getservice);
router.get("/service/org/all", getgetservices);
router.put("/service/org/:orgId/:uid", updateService);
router.delete("/service/org/:orgId/:uid", deleteService);

module.exports = router;