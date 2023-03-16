const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);


degreeCreate = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const db = client.db("apolloHMS");
        const payload = req.body;
        const degree = await mongo.insertOne(db, "degree-settings", payload);
        res.status(200).json({ success: !!degree, degree });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

getOrgdegree = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const degree = await mongo.fetchOne(db, "degree-settings", { uid, orgId });
        res.status(200).json({ success: !!degree, degree });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};
degreeUpdate = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const payload = req.body;
        const degree = await mongo.updateOne(db, "degree-settings", { uid, orgId }, payload);
        res.status(200).json({ success: !!degree, degree });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

degreeDelete = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const degree = await mongo.deleteData(db, "degree-settings", { uid, orgId });
        res.status(200).json({ success: !!degree, degree });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

router.post("/degrees", degreeCreate);
router.get("/degrees/org/:orgId/:uid", getOrgdegree);
router.put("/degrees/org/:orgId/:uid", degreeUpdate);
router.delete("/degrees/org/:orgId/:uid", degreeDelete);

module.exports = router;
