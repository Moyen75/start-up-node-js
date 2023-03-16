const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);
const { populateId } = require(`${root}/services/utilities`);
const { insertOne ,updateOne} = require(`${root}/services/mongo-transactions`);

// const authRoute = require(`${root}/middleware/authenticate`)
// const authorize = require(`${root}/middleware/authorize`);

setDueCollection = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const db = client.db("apolloHMS");
        const { invoiceId, orgId, collection, patient } = req.body;
        
        const account = {
            uid: populateId(),
            invoiceId,
            orgId,
            amount: Number(collection),
            type: 'income',
            description: "Collect due from outdoor patient.",
            name: 'Outdoor Due Collection',
            userId: patient,
            createdAt: Date.now(),
            category:"outdoor"
        };

        const payload = req.body;
        payload.createdAt = Date.now();
        payload.uid = populateId();

        const { paidAmount,dueAmount } = await mongo.fetchOne(db, "invoices", { invoiceType: "test", uid: invoiceId })
        
        const [dueCollection] = await mongo.transaction([{ operation: insertOne, operationParameter: [db, "od-due-collections", payload] }, { operation: insertOne, operationParameter: [db, "accounts", account] }, { operation: updateOne, operationParameter: [db, "invoices", { invoiceType: "test", uid: invoiceId }, { paidAmount: Number(collection) + Number(paidAmount),dueAmount:Number(dueAmount)-Number(collection), updatedAt: Date.now() }] }], client);
        
        res.status(200).json({ success: !!dueCollection, dueCollection });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

getOrgDueCollection = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const dueCollection = await mongo.fetchOne(db, "od-due-collections", { uid, orgId });
        res.status(200).json({ success: !!dueCollection, dueCollection });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

getOrgDueCollections = async (req, res, next) => {
    const client = await mongoConnect();
    const { orgId, pagination, limit } = req.query;
    try {
        const db = client.db("apolloHMS");
        const dueCollections = await mongo.fetchMany(
            db,
            "od-due-collections",
            { orgId },
            {},
            {},
            Number(limit) || 10,
            Number(pagination) || 0
        );
        const total = await mongo.documentCount(db, "od-due-collections", { orgId });
        res.status(200).json({ success: !!dueCollections, dueCollections, total });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

dueCollectionUpdate = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const payload = req.body;
        const dueCollection = await mongo.updateOne(
            db,
            "od-due-collections",
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

dueCollectionDelete = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const dueCollection = await mongo.deleteData(db, "od-due-collections", { uid, orgId });
        res.status(200).json({ success: !!dueCollection, dueCollection });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

router.post("/due-collections", setDueCollection);
router.get("/due-collections/org/:orgId/:uid", getOrgDueCollection);
router.get("/due-collections/org", getOrgDueCollections);
router.put("/due-collections/org/:orgId/:uid", dueCollectionUpdate);
router.delete("/due-collections/org/:orgId/:uid", dueCollectionDelete);

module.exports = router;
