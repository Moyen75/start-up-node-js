const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);
const { referredBy, patient, tests, doctor } = require(`${root}/services/populateQuery`)
const { populateId } = require(`${root}/services/utilities`);
const { insertOne, insertMany } = require(`${root}/services/mongo-transactions`);

setOrgTestInvoice = async (req, res, next) => {
    const client = await mongoConnect();
    const uid = populateId();
    try {
        const db = client.db("apolloHMS");
        const payload = req.body;
        payload.invoiceType = 'test';
        payload.uid = uid;
        payload.createdAt=Date.now()
        const { tests: alltest, patient: patientId, doctor: doctorId, orgId,paidAmount } = payload;
        const newTest = alltest.map(test => {
            return {
                testId: test,
                patient: patientId,
                doctor: doctorId,
                invoiceId: uid,
                uid: populateId(),
                status: "pending",
                orgId,
                createdAt:Date.now()
            }
        });
        const account = {
            uid: populateId(),
            invoiceId: uid,
            userId: patientId,
            orgId: orgId,
            name: "Test Invoice",
            type: "income",
            description: "Test invoice",
            amount: Number(paidAmount),
            createdAt: Date.now(),
            category:"outdoor"
       }
        const [testInvoice] = await mongo.transaction([{operation:insertOne,operationParameter:[db, "invoices", payload]},{operation:insertMany,operationParameter:[db,"test-reports",newTest]},{operation:insertOne,operationParameter:[db,"accounts",account]}],client);
        res.status(200).json({ success: !!testInvoice, testInvoice });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

getOrgTestInvoice = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const referredByLookUp = referredBy()
        const patientLookUp = patient();
        const testsLookUp = tests();
        const doctorLookUp = doctor();
        const query = [
            {
                '$match': {
                    orgId, uid
                }
            },
            ...referredByLookUp,
            ...patientLookUp,
            ...testsLookUp,
            ...doctorLookUp,

        ]
        const db = client.db("apolloHMS");
        const testInvoice = await mongo.fetchWithAggregation(
            db,
            "invoices",
            query,
            {},
            { createdAt: -1 }
        );

        res.status(200).json({ success: !!testInvoice, testInvoice: testInvoice[0] });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

getOrgTestInvoices = async (req, res, next) => {
    const client = await mongoConnect();
    const { orgId, pagination, limit, fromDate, toDate } = req.query;
    try {
        const referredByLookUp = referredBy()
        const patientLookUp = patient();
        const testsLookUp = tests();
        const doctorLookUp = doctor();
        const min = fromDate ? Date.parse(fromDate) : 0;
        let max = toDate  ? Date.parse(toDate) : new Date().getTime();
        max = new Date(max).setHours(23, 59, 59, 999);
        const match = { orgId, 'createdAt': { '$gte': min, '$lte': max } ,invoiceType:"test"};
        const query = [
            {
                '$match': match
            },
            ...referredByLookUp,
            ...patientLookUp,
            ...testsLookUp,
            ...doctorLookUp,
        ]
        const db = client.db("apolloHMS");
        const testInvoice = await mongo.fetchWithAggregation(
            db,
            "invoices",
            query,
            {},
            { createdAt: -1 },
            Number(limit) || 10,
            Number(pagination) || 0
        );

        const total = await mongo.documentCount(db, "invoices", match);
        res.status(200).json({ success: !!testInvoice, testInvoice, total });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

updateTestInvoice = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const payload = req.body;
        const testInvoice = await mongo.updateOne(db, "invoices", { uid, orgId }, payload);
        res.status(200).json({ success: !!testInvoice, testInvoice });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

deleteTestInvoice = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const testInvoice = await mongo.deleteData(db, "invoices", {
            uid,
            orgId,
        });
        res.status(200).json({ success: !!testInvoice, testInvoice });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

router.post("/tests/invoices", setOrgTestInvoice);
router.get("/tests/invoices/org/:orgId/:uid", getOrgTestInvoice);
router.get("/tests/invoices/org", getOrgTestInvoices);
router.put("/tests/invoices/org/:orgId/:uid", updateTestInvoice);
router.delete("/tests/invoices/org/:orgId/:uid", deleteTestInvoice);

module.exports = router;
