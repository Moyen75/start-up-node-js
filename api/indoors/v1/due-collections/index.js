const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);
const { populateId } = require(`${root}/services/utilities`);
const { insertOne,updateOne } = require(`${root}/services/mongo-transactions`);

// const authRoute = require(`${root}/middleware/authenticate`)
// const authorize = require(`${root}/middleware/authorize`);

createDueCollection = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const db = client.db("apolloHMS");
        const payload = req.body;
        const { invoiceId, orgId, collection, patient } = payload;
        payload.uid = populateId();
        const account = {
            uid: populateId(),
            invoiceId,
            orgId,
            amount: Number(collection),
            type: 'income',
            description: "Collect due from indoor patient.",
            name: 'Indoor Due Collection',
            userId: patient
        };

        const { paidAmount,dueAmount } = await mongo.fetchOne(db, "invoices", { uid: invoiceId, invoiceType: "admission" });
        const [dueCollection] = await mongo.transaction([{ operation: insertOne, operationParameter: [db, "id-due-collections", payload] }, { operation: insertOne, operationParameter: [db, "accounts", account] }, { operation: updateOne, operationParameter: [db, "invoices", { uid: invoiceId, invoiceType: "admission" }, { paidAmount: Number(paidAmount) + Number(collection) ,dueAmount:Number(dueAmount)-Number(collection)}] }], client);
        
        res.status(200).json({ success: !!dueCollection, dueCollection });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

getDueCollection = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const dueCollection = await mongo.fetchOne(db, "id-due-collections", { uid, orgId });
        res.status(200).json({ success: !!dueCollection, dueCollection });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

getDueCollections = async (req, res, next) => {
    const client = await mongoConnect();
    const { orgId, pagination, limit } = req.query;
    try {
        const db = client.db("apolloHMS");
        const dueCollections = await mongo.fetchMany(
            db,
            "id-due-collections",
            { orgId },
            {},
            {},
            Number(limit) || 10,
            Number(pagination) || 0
        );
        const total = await mongo.documentCount(db, "id-due-collections", { orgId });
        res.status(200).json({ success: !!dueCollections, dueCollections, total });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

updateDueCollection = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const payload = req.body;
        const dueCollection = await mongo.updateOne(
            db,
            "id-due-collections",
            { uid, orgId },
            payload
        );
        res.status(200).json({ success: !!dueCollection, dueCollection });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

deleteDueCollection = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const dueCollection = await mongo.deleteData(db, "id-due-collections", { uid, orgId });
        res.status(200).json({ success: !!dueCollection, dueCollection });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

router.post("/due-collections", createDueCollection);
router.get("/due-collections/org/:orgId/:uid", getDueCollection);
router.get("/due-collections/org", getDueCollections);
router.put("/due-collections/org/:orgId/:uid", updateDueCollection);
router.delete("/due-collections/org/:orgId/:uid", deleteDueCollection);

module.exports = router;
