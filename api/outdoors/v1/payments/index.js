const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);
const { patient, doctor } = require(`${root}/services/populateQuery`);
const { insertMany, updateMany } = require(`${root}/services/mongo-transactions`);
const { populateId } = require(`${root}/services/utilities`);


// const authRoute = require(`${root}/middleware/authenticate`)
// const authorize = require(`${root}/middleware/authorize`);

getVisitPayment = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const patientLookUp = patient();
        const doctorLookUp = doctor();

        const query = [
            {
                '$match': {
                    orgId,
                    uid
                }
            }, 
             ...patientLookUp,
             ...doctorLookUp,
           
        ]
        const db = client.db("apolloHMS");
        const payment = await mongo.fetchWithAggregation (db,"bills",query,{},{ createdAt: -1 });
        res.status(200).json({ success: !!payment, payment: payment[0] });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

getVisitPayments = async (req, res, next) => {
    const client = await mongoConnect();
    const { orgId, pagination, limit ,fromDate,toDate,doctorId,status} = req.query;
    try {
        const min = fromDate ? Date.parse(fromDate) : 0;
        let max = toDate ? Date.parse(toDate) : new Date().getTime();
        max = new Date(max).setHours(23, 59, 59, 999);
        let match = { orgId, billType: "visit", 'createdAt': { '$gte': min, '$lte': max } };

        if (doctorId) match = { ...match, doctor: doctorId };
        if (status && status !== "all") match = { ...match, status };
        
        const patientLookUp = patient();
        const doctorLookUp = doctor();
        const query = [
            {
                '$match': match
            },
            ...patientLookUp,
            ...doctorLookUp,
        ];
        const db = client.db("apolloHMS");
      
        const payments = await mongo.fetchWithAggregation(
            db,
            "bills",
            query,
            {},
            { createdAt: -1 },
            Number(limit) || 10,
            Number(pagination) || 0
        );
        const total = await mongo.documentCount(db, "bills", match);
        res.status(200).json({ success: !!payments, payments, total });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

updateVisitPayment = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const payload = req.body;
        delete payload._id;
        const payment = await mongo.updateOne(
            db,
            "bills",
            { uid, orgId },
            payload
        );
        res.status(200).json({ success: !!payment, payment });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};
updateVisitPayments = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const db = client.db("apolloHMS");
        const { status, orgId } = req.query;
        const payload = req.body;

        const accounts = payload.map(obj => {
            return {
                uid:populateId(),
                invoiceId: obj.uid,
                orgId,
                createdAt:Date.now(),
                type: 'expense',
                userId: obj.doctor.uid,
                name: "Doctor visit payment",
                description: "Doctor visit payment",
                amount: Number(obj.visitAmount),
                createdAt: Date.now(),
                category:"outdoor"
            }
        });
        const allUid = payload.map(obj => obj.uid);
        const query = { status, orgId, uid: { "$in": allUid }, billType: "visit" };
        
        const payment = await mongo.transaction([{operation:insertMany,operationParameter:[db,"accounts",accounts]},{operation:updateMany,operationParameter:[db,"bills",query,{status:"paid"}]}],client);
        res.status(200).json({ success: !!payment });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

deleteVisitPayment = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const payment = await mongo.deleteData(db, "bills", { uid, orgId });
        res.status(200).json({ success: !!payment, payment });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

router.get("/payments/org/:orgId/:uid", getVisitPayment);
router.get("/payments/org", getVisitPayments);
router.put("/payments/org/:orgId/:uid", updateVisitPayment);
router.put("/payments/org", updateVisitPayments);
router.delete("/payments/org/:orgId/:uid", deleteVisitPayment);

module.exports = router;
