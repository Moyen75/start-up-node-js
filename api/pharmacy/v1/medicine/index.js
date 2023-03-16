const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);

medicineCreate = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const db = client.db("apolloHMS");
        const medicine = await mongo.insertOne(db, "medicine", req.body);
        res.status(200).json({ success: !!medicine, medicine });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

getOrgMedicine = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const medicine = await mongo.fetchOne(db, "medicine", {
            uid,
            orgId,
        });
        res.status(200).json({ success: !!medicine, medicine });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

getOrgMedicines = async (req, res, next) => {
    const client = await mongoConnect();
    const { orgId, pagination, limit } = req.query;
    try {
        const db = client.db("apolloHMS");
        const medicine = await mongo.fetchMany(
            db,
            "medicine",
            { orgId },
            {},
            {},
            Number(limit) || 10,
            Number(pagination) || 0
        );
        const total = await mongo.documentCount(db, "medicine", { orgId });
        res.status(200).json({ success: !!medicine, medicine, total });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

medicineUpdate = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const payload = req.body;
        delete payload._id;
        const medicine = await mongo.updateOne(
            db,
            "medicine",
            { uid, orgId },
            payload
        );
        res.status(200).json({ success: !!medicine, medicine });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

medicineDelete = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const medicine = await mongo.deleteData(db, "medicine", {
            uid,
            orgId,
        });
        res.status(200).json({ success: !!medicine, medicine });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

router.post("/medicine", medicineCreate);
router.get("/medicine/org/:orgId/:uid", getOrgMedicine);
router.get("/medicine/org", getOrgMedicines);
router.put("/medicine/org/:orgId/:uid", medicineUpdate);
router.delete("/medicine/org/:orgId/:uid", medicineDelete);

module.exports = router;
