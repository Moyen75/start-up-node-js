const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);
const { test, invoice, patient, doctor } = require(`${root}/services/populateQuery`);

setReport = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const db = client.db("apolloHMS");
        const report = await mongo.insertOne(db, "test-reports", req.body)
        res.status(200).json({ success: !!report, report });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};
getReport = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { uid, orgId } = req.params;
        const testLookUp = test();
        const invoiceLookUp = invoice();
        const patientLookUp = patient();
        const doctorLookUp = doctor();
        const db = client.db("apolloHMS");
        let match = { orgId, uid };
        const query = [
            {
                "$match": match
            },
            ...testLookUp,
            // ...invoiceLookUp,
            ...patientLookUp,
            ...doctorLookUp
        ]
        const report = await mongo.fetchWithAggregation(
            db,
            "test-reports",
            query,
            {},
            { createdAt: 1 },
        );
        res.status(200).json({ success: !!report, report: report[0] });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};
updateReport = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { uid, orgId } = req.params
        const db = client.db("apolloHMS");
        const report = await mongo.updateOne(db, "test-reports", { uid, orgId }, req.body)
        res.status(200).json({ success: !!report, report });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};
getReports = async (req, res, next) => {
    const client = await mongoConnect();
    const db = client.db("apolloHMS");
    try {
        const { orgId, pagination, limit, status, fromDate, toDate, referredBy, testId } = req.query;

        const testLookUp = test();
        // const invoiceLookUp = invoice();
        const patientLookUp = patient();
        const doctorLookUp = doctor();

        const min = fromDate ? Date.parse(fromDate) : 0;
        let max = toDate  ? Date.parse(toDate) : new Date().getTime();
        max = new Date(max).setHours(23, 59, 59, 999);
        let match = { orgId, 'createdAt': { '$gte': min, '$lte': max } };
        if (status && status !== "all") match = { ...match, status }
        if (referredBy) match = { ...match, referredBy };
        if (testId) match = { ...match, testId }
        const query = [
            {
                "$match": match
            },
            ...testLookUp,
            ...patientLookUp,
            ...doctorLookUp
        ]
        const reports = await mongo.fetchWithAggregation(
            db,
            "test-reports",
            query,
            {},
            { createdAt: 1 },
            Number(limit) || 10,
            Number(pagination) || 0
        );
        const total = await mongo.documentCount(db, "test-reports", match)
        res.status(200).json({ success: !!reports, reports, total });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};
deleteReport = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { uid, orgId } = req.params;
        const db = client.db("apolloHMS");
        const report = await mongo.deleteData(db, "test-reports", { uid, orgId })
        res.status(200).json({ success: !!report, report });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};

router.post("/reports", setReport)
router.get("/reports/org/:orgId/:uid", getReport)
router.get("/reports/org", getReports)
router.put("/reports/org/:orgId/:uid", updateReport)
router.delete("/reports/org/:orgId/:uid", deleteReport)

module.exports = router;