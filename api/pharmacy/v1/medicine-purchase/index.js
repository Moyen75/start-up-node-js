const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);

createMedicinePurchase = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const db = client.db("apolloHMS");
        const purchase = await mongo.insertOne(db, "medicinePurchase", req.body);
        res.status(200).json({ success: !!purchase, purchase });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

getOrgMedicinePurchase = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const purchase = await mongo.fetchOne(db, "medicinePurchase", {
            uid,
            orgId,
        });
        res.status(200).json({ success: !!purchase, purchase });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

getOrgMedicinesPurchase = async (req, res, next) => {
    const client = await mongoConnect();
    const { orgId, pagination, limit } = req.query;
    try {
        const db = client.db("apolloHMS");
        const purchase = await mongo.fetchMany(
            db,
            "medicinePurchase",
            { orgId },
            {},
            {},
            Number(limit) || 10,
            Number(pagination) || 0
        );
        const total = await mongo.documentCount(db, "medicinePurchase", { orgId });
        res.status(200).json({ success: !!purchase, purchase, total });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

updateMedicinePurchase = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const payload = req.body;
        delete payload._id;
        const purchase = await mongo.updateOne(
            db,
            "medicinePurchase",
            { uid, orgId },
            payload
        );
        res.status(200).json({ success: !!purchase, purchase });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

deleteMedicinePurchase = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const purchase = await mongo.deleteData(db, "medicinePurchase", {
            uid,
            orgId,
        });
        res.status(200).json({ success: !!purchase, purchase });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

router.post("/medicine/purchase", createMedicinePurchase);
router.get("/medicine/purchase/org/:orgId/:uid", getOrgMedicinePurchase);
router.get("/medicine/purchase/org", getOrgMedicinesPurchase);
router.put("/medicine/purchase/org/:orgId/:uid", updateMedicinePurchase);
router.delete("/medicine/purchase/org/:orgId/:uid", deleteMedicinePurchase);

module.exports = router;
