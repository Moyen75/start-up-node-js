const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);


setMRI = async (req, res, next) => {
    const client = await mongoConnect();
    try {

        const db = client.db("apolloHMS");
        const mri = await mongo.insertOne(db, "mri", req.body);
        res.status(200).json({ success: !!mri, mri });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};
getMRI = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const mri = await mongo.fetchOne(db, "mri", { orgId, uid });
        delete mri._id;
        res.status(200).json({ success: !!mri, mri });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
getMRIs = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, pagination, limit } = req.query;
        const db = client.db("apolloHMS");
        const mris = await mongo.fetchMany(
            db,
            "mri",
            { orgId },
            { _id: 0 },
            {},
            Number(limit) || 10,
            Number(pagination) || 0);
        const total = await mongo.documentCount(db, "mri", { orgId })
        res.status(200).json({ success: !!mris, mris, total });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
updateMRI = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const mri = await mongo.updateOne(db, "mri", { orgId, uid }, req.body);
        res.status(200).json({ success: !!mri, mri });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
deleteMRI = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const mri = await mongo.deleteData(db, "mri", { orgId, uid }, req.body);
        res.status(200).json({ success: !!mri, mri });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}

router.post("/mri", setMRI)
router.get("/mri/org", getMRIs)
router.get("/mri/org/:orgId/:uid", getMRI)
router.put("/mri/org/:orgId/:uid", updateMRI);
router.delete("/mri/org/:orgId/:uid", deleteMRI);

module.exports = router;