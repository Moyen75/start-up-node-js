const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);

createMedicineSales = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const db = client.db("apolloHMS");
        const sales = await mongo.insertOne(db, "medicinesSales", req.body);
        res.status(200).json({ success: !!sales, sales });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

getOrgMedicineSales = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const sales = await mongo.fetchOne(db, "medicinesSales", {
            uid,
            orgId,
        });
        res.status(200).json({ success: !!sales, sales });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

getOrgMedicinesSales = async (req, res, next) => {
    const client = await mongoConnect();
    const { orgId, pagination, limit } = req.query;
    try {
        const db = client.db("apolloHMS");
        const sales = await mongo.fetchMany(
            db,
            "medicinesSales",
            { orgId },
            {},
            {},
            Number(limit) || 10,
            Number(pagination) || 0
        );
        const total = await mongo.documentCount(db, "medicinesSales", { orgId });
        res.status(200).json({ success: !!sales, sales, total });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

updateMedicineSales = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const payload = req.body;
        delete payload._id;
        const sales = await mongo.updateOne(
            db,
            "medicinesSales",
            { uid, orgId },
            payload
        );
        res.status(200).json({ success: !!sales, sales });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

deleteMedicineSales = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const sales = await mongo.deleteData(db, "medicinesSales", {
            uid,
            orgId,
        });
        res.status(200).json({ success: !!sales, sales });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

router.post("/medicine/sales", createMedicineSales);
router.get("/medicine/sales/org/:orgId/:uid", getOrgMedicineSales);
router.get("/medicine/sales/org", getOrgMedicinesSales);
router.put("/medicine/sales/org/:orgId/:uid", updateMedicineSales);
router.delete("/medicine/sales/org/:orgId/:uid", deleteMedicineSales);

module.exports = router;
