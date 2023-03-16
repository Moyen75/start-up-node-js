const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);


setEchoCardiogram = async (req, res, next) => {
    const client = await mongoConnect();
    try {

        const db = client.db("apolloHMS");
        const echoCardiogram = await mongo.insertOne(db, "echo-cardiogram", req.body);
        res.status(200).json({ success: !!echoCardiogram, echoCardiogram });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};
getEchoCardiogram = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const echoCardiogram = await mongo.fetchOne(db, "echo-cardiogram", { orgId, uid });
        delete echoCardiogram._id;
        res.status(200).json({ success: !!echoCardiogram, echoCardiogram });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
getEchoCardiograms = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, pagination, limit } = req.query;
        const db = client.db("apolloHMS");
        const echoCardiograms = await mongo.fetchMany(
            db,
            "echo-cardiogram",
            { orgId },
            { _id: 0 },
            {},
            Number(limit) || 10,
            Number(pagination) || 0);
        const total = await mongo.documentCount(db, "echo-cardiogram", { orgId })
        res.status(200).json({ success: !!echoCardiograms, echoCardiograms, total });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
updateEchoCardiogram = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const echoCardiogram = await mongo.updateOne(db, "echo-cardiogram", { orgId, uid }, req.body);
        res.status(200).json({ success: !!echoCardiogram, echoCardiogram });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
deleteEchoCardiogram = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const echoCardiogram = await mongo.deleteData(db, "echo-cardiogram", { orgId, uid }, req.body);
        res.status(200).json({ success: !!echoCardiogram, echoCardiogram });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}

router.post("/echo-cardiogram", setEchoCardiogram)
router.get("/echo-cardiogram/org", getEchoCardiograms)
router.get("/echo-cardiogram/org/:orgId/:uid", getEchoCardiogram)
router.put("/echo-cardiogram/org/:orgId/:uid", updateEchoCardiogram);
router.delete("/echo-cardiogram/org/:orgId/:uid", deleteEchoCardiogram);

module.exports = router;