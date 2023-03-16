const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);

setDressing = async (req, res, next) => {
    const client = await mongoConnect();
    try {

        const db = client.db("apolloHMS");
        const dressing = await mongo.insertOne(db, "dressings", req.body);
        res.status(200).json({ success: !!dressing, dressing });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};
getDressing = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const dressing = await mongo.fetchOne(db, "dressings", { uid, orgId });
        res.status(200).json({ success: !!dressing, dressing });
    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
getDressings = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, pagination, limit } = req.query;
        const db = client.db("apolloHMS");
        const dressings = await mongo.fetchMany(
            db,
            "dressings",
            { orgId },
            {},
            {},
            Number(limit) || 10,
            Number(pagination) || 0
        );
        const total = await mongo.documentCount(db, "dressings", { orgId })
        res.status(200).json({ success: !!dressings, dressings, total });
    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
updateDressing = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const dressing = await mongo.updateOne(db, "dressings", { orgId, uid }, req.body);
        res.status(200).json({ success: !!dressing, dressing });
    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};
deleteDressing = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const dressing = await mongo.deleteData(db, "dressings", { orgId, uid });
        res.status(200).json({ success: !!dressing, dressing });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}

router.post("/dressings", setDressing);
router.get("/dressings/org/all", getDressings);
router.get("/dressings/org/:orgId/:uid", getDressing);
router.put("/dressings/org/:orgId/:uid", updateDressing);
router.delete("/dressings/org/:orgId/:uid", deleteDressing);

module.exports = router;