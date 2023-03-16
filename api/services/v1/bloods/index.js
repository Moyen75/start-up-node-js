const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);

setBlood = async (req, res, next) => {
    const client = await mongoConnect();
    try {

        const db = client.db("apolloHMS");
        const blood = await mongo.insertOne(db, "bloods", req.body);
        res.status(200).json({ success: !!blood, blood });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};
getBlood = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const query = { orgId, uid }
        const blood = await mongo.fetchOne(db, "bloods", query);
        res.status(200).json({ success: !!blood, blood });
    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
getBloods = async (req, res, next) => {
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
updateBlood = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const blood = await mongo.updateOne(db, "bloods", { orgId, uid }, req.body);
        res.status(200).json({ success: !!blood, blood });
    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};
deleteBlood = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const blood = await mongo.deleteData(db, "bloods", { orgId, uid });
        res.status(200).json({ success: !!blood, blood });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}

router.post("/bloods", setBlood);
router.get("/bloods/org/all", getBloods);
router.get("/bloods/org/:orgId/:uid", getBlood);
router.put("/bloods/org/:orgId/:uid", updateBlood);
router.delete("/bloods/org/:orgId/:uid", deleteBlood);

module.exports = router;