const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);


setxRay = async (req, res, next) => {
    const client = await mongoConnect();
    try {

        const db = client.db("apolloHMS");
        const xRay = await mongo.insertOne(db, "x-ray", req.body);
        res.status(200).json({ success: !!xRay, xRay });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};
getxRay = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const xRay = await mongo.fetchOne(db, "x-ray", { orgId, uid });
        delete xRay._id;
        res.status(200).json({ success: !!xRay, xRay });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
getxRays = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, pagination, limit } = req.query;
        const db = client.db("apolloHMS");
        const xRays = await mongo.fetchMany(
            db,
            "x-ray",
            { orgId },
            { _id: 0 },
            {},
            Number(limit) || 10,
            Number(pagination) || 0);
        const total = await mongo.documentCount(db, "x-ray", { orgId })
        res.status(200).json({ success: !!xRays, xRays, total });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
updatexRay = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const xRay = await mongo.updateOne(db, "x-ray", { orgId, uid }, req.body);
        res.status(200).json({ success: !!xRay, xRay });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
deletexRay = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const xRay = await mongo.deleteData(db, "x-ray", { orgId, uid }, req.body);
        res.status(200).json({ success: !!xRay, xRay });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}

router.post("/x-ray", setxRay)
router.get("/x-ray/org", getxRays)
router.get("/x-ray/org/:orgId/:uid", getxRay)
router.put("/x-ray/org/:orgId/:uid", updatexRay);
router.delete("/x-ray/org/:orgId/:uid", deletexRay);

module.exports = router;