const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);


setUsg = async (req, res, next) => {
    const client = await mongoConnect();
    try {

        const db = client.db("apolloHMS");
        const usg = await mongo.insertOne(db, "usg", req.body);
        res.status(200).json({ success: !!usg, usg });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};
getUsg = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const usg = await mongo.fetchOne(db, "usg", { orgId, uid });
        delete usg._id;
        res.status(200).json({ success: !!usg, usg });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
getUsgs = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, pagination, limit } = req.query;
        const db = client.db("apolloHMS");
        const usgs = await mongo.fetchMany(
            db,
            "usg",
            { orgId },
            { _id: 0 },
            {},
            Number(limit) || 10,
            Number(pagination) || 0);
        const total = await mongo.documentCount(db, "usg", { orgId })
        res.status(200).json({ success: !!usgs, usgs, total });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
updateUsg = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const usg = await mongo.updateOne(db, "usg", { orgId, uid }, req.body);
        res.status(200).json({ success: !!usg, usg });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
deleteUsg = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const usg = await mongo.deleteData(db, "usg", { orgId, uid }, req.body);
        res.status(200).json({ success: !!usg, usg });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}

router.post("/usg", setUsg)
router.get("/usg/org", getUsgs)
router.get("/usg/org/:orgId/:uid", getUsg)
router.put("/usg/org/:orgId/:uid", updateUsg);
router.delete("/usg/org/:orgId/:uid", deleteUsg);

module.exports = router;