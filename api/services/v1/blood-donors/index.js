const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);


bloodDonors = async (req, res, next) => {
    const client = await mongoConnect();
    try {

        const db = client.db("apolloHMS");
        const donor = await mongo.insertOne(db, "donors", req.body);
        res.status(200).json({ success: !!donor, donor });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};
getBloodDonor = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const query = { orgId }
        const donor = await mongo.fetchOne(db, "donors", query);
        res.status(200).json({ success: !!donor, donor });
    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
getBloodsDonors = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, pagination, limit } = req.query;
        const db = client.db("apolloHMS");
        const query = { orgId }
        const bloods = await mongo.fetchWithAggregation(
            db,
            "bloods",
            query,
            {},
            { createdAt: 1 },
            Number(limit) || 10,
            Number(pagination) || 0
        );
        const total = await mongo.documentCount(db, "bloods", { orgId })
        res.status(200).json({ success: !!bloods, bloods, total });
    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
updateBloodDonors = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const donor = await mongo.updateOne(db, "donors", { orgId, uid }, req.body);
        res.status(200).json({ success: !!donor, donor });
    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};
deleteBloodDonor = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const donor = await mongo.deleteData(db, "donors", { orgId, uid });
        res.status(200).json({ success: !!donor, donor });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}

router.post("/bloods/donors", bloodDonors);
router.get("/bloods/donors/org/:orgId/:uid", getBloodDonor);
router.get("/bloods/donors/org/all", getBloodsDonors);
router.put("/bloods/donors/org/:orgId/:uid", updateBloodDonors);
router.delete("/bloods/donors/org/:orgId/:uid", deleteBloodDonor);

module.exports = router;