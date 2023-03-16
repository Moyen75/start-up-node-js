const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);
const { patient, referredBy, doctor } = require(`${root}/services/populateQuery`);
const { populateId } = require(`${root}/services/utilities`);
const { insertOne } = require(`${root}/services/mongo-transactions`);

setInvoice = async (req, res, next) => {
    const client = await mongoConnect();
    const db = client.db("apolloHMS");
    try {
        const uid = populateId();
        const payload = req.body;
        payload.uid = uid;
        payload.createdAt = Date.now();
        payload.invoiceType = "emergency";
        const { patient: patientId ,paidAmount} = payload;
        const account = {
            uid: populateId(),
            invoiceId: uid,
            userId: patientId,
            type: "income",
            name: "Emergency Invoice",
            description: "Emergency invoice",
            amount: Number(paidAmount),
            createdAt: Date.now()
        }
        const invoice = await mongo.transaction([{operation:insertOne,operationParameter:[db, "invoices", payload]},{operation:insertOne,operationParameter:[db,"accounts",account]}],client);
        res.status(200).json({ success: !!invoice, invoice });
    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};
getInvoice = async (req, res, next) => {
    const client = await mongoConnect();
    const { orgId, uid } = req.params;
    try {
        const db = client.db("apolloHMS");
        const patientLookUp = patient();
        const referredByLookUp = referredBy()
        const doctorLookUp = doctor()
        const query = [
            {
                "$match": {
                    orgId, uid
                }
            },
            ...patientLookUp,
            ...referredByLookUp,
            ...doctorLookUp
        ]
        const invoice = await mongo.fetchWithAggregation(
            db,
            "invoices",
            query,
            {},
            { createdAt: 1 }
        );
        res.status(200).json({ success: !!invoice, invoice: invoice[0] });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
getInvoices = async (req, res, next) => {
    const client = await mongoConnect();
    const { orgId, pagination, limit } = req.query;
    try {
        const db = client.db("apolloHMS");
        const patientLookUp = patient();
        const referredByLookUp = referredBy()
        const doctorLookUp = doctor()
        const query = [
            {
                "$match": {
                    orgId,
                    invoiceType:"emergency"
                }
            },
            ...patientLookUp,
            ...referredByLookUp,
            ...doctorLookUp
        ]
        const invoices = await mongo.fetchWithAggregation(
            db,
            "invoices",
            query,
            {},
            { createdAt: 1 },
            Number(limit) || 10,
            Number(pagination) || 0
        );
        const total = await mongo.documentCount(db, "invoices", { orgId });
        res.status(200).json({ success: !!invoices, invoices, total });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
updateInvoice = async (req, res, next) => {
    const client = await mongoConnect();
    const { orgId, uid } = req.params;
    try {
        const db = client.db("apolloHMS");
        const invoice = await mongo.updateOne(db, "invoices", { orgId, uid }, req.body);
        res.status(200).json({ success: !!invoice, invoice });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};
deleteInvoice = async (req, res, next) => {
    const client = await mongoConnect();
    const { orgId, uid } = req.params;
    try {
        const db = client.db("apolloHMS");
        const invoice = await mongo.deleteData(db, "invoices", { orgId, uid });
        res.status(200).json({ success: !!invoice, invoice });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};

router.post("/emergencies/invoices", setInvoice);
router.get("/emergencies/invoices/org/:orgId/:uid", getInvoice);
router.get("/emergencies/invoices/org/all", getInvoices);
router.put("/emergencies/invoices/org/:orgId/:uid", updateInvoice);
router.delete("/emergencies/invoices/org/:orgId/:uid", deleteInvoice)

module.exports = router;