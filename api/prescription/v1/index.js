const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);
const { patient, doctor } = require(`${root}/services/populateQuery`);

setPrescription = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const db = client.db("apolloHMS");
        const prescription = await mongo.insertOne(db, "prescription", req.body);
        res.status(200).json({ success: !!prescription, prescription });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

getPrescription = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const patientLookUp = patient();
        const doctorLookUp = doctor();
        const query = [
            {
                "$match": {
                    orgId, uid
                }
            },
            ...patientLookUp,
            ...doctorLookUp
        ]
        const prescription = await mongo.fetchWithAggregation(
            db,
            "prescription",
            query,
            {},
            { createdAt: 1 }
        );
        res.status(200).json({ success: !!prescription, prescription: prescription[0] });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

getPrescriptions = async (req, res, next) => {
    const client = await mongoConnect();
    const { orgId, pagination, limit, fromDate, toDate } = req.query;
    try {
        const db = client.db("apolloHMS");
        const patientLookUp = patient();
        const doctorLookUp = doctor();
        const min = fromDate ? Date.parse(fromDate) : 0;
        let max = toDate ? Date.parse(toDate) : new Date().getTime();
        max = new Date(max).setHours(23, 59, 59, 999);
        const match = { orgId, "createdAt": { "$gte": min, "$lte": max } };
        const query = [
            {
                "$match": match
            },
            ...patientLookUp,
            ...doctorLookUp
        ]
        const prescription = await mongo.fetchWithAggregation(
            db,
            "prescription",
            query,
            {},
            { createdAt: 1 },
            Number(limit) || 10,
            Number(pagination) || 0
        );
        const total = await mongo.documentCount(db, "prescription", match);
        res.status(200).json({ success: !!prescription, prescription, total });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

updatePrescription = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const payload = req.body;
        delete payload._id;
        const prescription = await mongo.updateOne(
            db,
            "prescription",
            { uid, orgId },
            payload
        );
        res.status(200).json({ success: !!prescription, prescription });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

deletePrescription = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const prescription = await mongo.deleteData(db, "prescription", {
            uid,
            orgId,
        });
        res.status(200).json({ success: !!prescription, prescription });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

router.post("/prescription", setPrescription);
router.get("/prescription/org/:orgId/:uid", getPrescription);
router.get("/prescription/org", getPrescriptions);
router.put("/prescription/org/:orgId/:uid", updatePrescription);
router.delete("/prescription/org/:orgId/:uid", deletePrescription);

module.exports = router;
