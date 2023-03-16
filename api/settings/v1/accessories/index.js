const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);


setAccessories = async (req, res, next) => {
    const client = await mongoConnect();
    try {

        const db = client.db("apolloHMS");
        const payload = req.body;
        const accessories = await mongo.insertOne(db, "accessories-settings", payload);
        res.status(200).json({ success: !!accessories, accessories });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

getAccessories = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const accessories = await mongo.fetchOne(db, "accessories-settings", { uid, orgId });
        res.status(200).json({ success: !!accessories, accessories });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};
updateAccessories = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const payload = req.body;

        const accessories = await mongo.updateOne(db, "accessories-settings", { uid, orgId }, payload);
        res.status(200).json({ success: !!accessories, accessories });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

deleteAccessories = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const accessories = await mongo.deleteData(db, "accessories-settings", { uid, orgId });
        res.status(200).json({ success: !!accessories, accessories });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

router.post("/accessories", setAccessories);
router.get("/accessories/org/:orgId/:uid", getAccessories);
router.put("/accessories/org/:orgId/:uid", updateAccessories);
router.delete("/accessories/org/:orgId/:uid", deleteAccessories);

module.exports = router;
