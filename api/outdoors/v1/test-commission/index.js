
const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);


// const authRoute = require(`${root}/middleware/authenticate`)
// const authorize = require(`${root}/middleware/authorize`);

setTestCommission = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const db = client.db("apolloHMS");
        const payload = req.body
        const commission = await mongo.insertOne(db, "test-commission", payload);
        res.status(200).json({ success: !!commission, commission });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

getTestCommission = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const commission = await mongo.fetchOne(db, "test-commission", { uid, orgId });
        res.status(200).json({ success: !!commission, commission });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

getTestCommissions = async (req, res, next) => {
    const client = await mongoConnect();
    const { orgId, pagination, limit, fromDate, toDate, referredBy } = req.query;
    try {
        const db = client.db("apolloHMS");
        const min = fromDate ? Date.parse(fromDate) : 0;
        let max = toDate ? Date.parse(toDate) : new Date().getTime();
        max = new Date(max).setHours(23, 59, 59, 999);
        let query = { orgId, "createdAt": { "$gte": min, "$lte": max } };
        if (referredBy) query = { ...query, referredBy };
        const commission = await mongo.fetchWithAggregation(
            db,
            "test-commission",
            [
                {
                    "$match": query
                }
            ],
            {},
            { createdAt: 1 },
            Number(limit) || 10,
            Number(pagination) || 0
        );
        const total = await mongo.documentCount(db, "test-commission", query);
        res.status(200).json({ success: !!commission, commission, total });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

updateTestCommission = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const payload = req.body;
        const commission = await mongo.updateOne(
            db,
            "test-commission",
            { uid, orgId },
            payload
        );
        res.status(200).json({ success: !!commission, commission });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

deleteTestCommission = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const commission = await mongo.deleteData(db, "test-commission", { uid, orgId });
        res.status(200).json({ success: !!commission, commission });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

router.post("/test/commission", setTestCommission);
router.get("/test/commission/org/:orgId/:uid", getTestCommission);
router.get("/test/commission/org", getTestCommissions);
router.put("/test/commission/org/:orgId/:uid", updateTestCommission);
router.delete("/test/commission/org/:orgId/:uid", deleteTestCommission);

module.exports = router;
