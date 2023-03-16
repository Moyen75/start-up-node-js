const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);


setAngiogram = async (req, res, next) => {
    const client = await mongoConnect();
    try {

        const db = client.db("apolloHMS");
        const angiogram = await mongo.insertOne(db, "angiogram", req.body);
        res.status(200).json({ success: !!angiogram, angiogram });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};
getAngiogram = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const angiogram = await mongo.fetchOne(db, "angiogram", { orgId, uid });
        delete angiogram._id;
        res.status(200).json({ success: !!angiogram, angiogram });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
getAngiograms = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, pagination, limit } = req.query;
        const db = client.db("apolloHMS");
        const angiogram = await mongo.fetchMany(
            db,
            "angiogram",
            { orgId },
            { _id: 0 },
            {},
            Number(limit) || 10,
            Number(pagination) || 0);
        const total = await mongo.documentCount(db, "angiogram", { orgId })
        res.status(200).json({ success: !!angiogram, angiogram, total });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
updateAngiogram = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const angiogram = await mongo.updateOne(db, "angiogram", { orgId, uid }, req.body);
        res.status(200).json({ success: !!angiogram, angiogram });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
deleteAngiogram = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const angiogram = await mongo.deleteData(db, "angiogram", { orgId, uid }, req.body);
        res.status(200).json({ success: !!angiogram, angiogram });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}

router.post("/angiogram", setAngiogram)
router.get("/angiogram/org", getAngiograms)
router.get("/angiogram/org/:orgId/:uid", getAngiogram)
router.put("/angiogram/org/:orgId/:uid", updateAngiogram);
router.delete("/angiogram/org/:orgId/:uid", deleteAngiogram);

module.exports = router;