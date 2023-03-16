const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);
const { patient, doctor } = require(`${root}/services/populateQuery`);
const {insertOne}=require(`${root}/services/mongo-transactions`)
const { populateId } = require(`${root}/services/utilities`);


// const authRoute = require(`${root}/middleware/authenticate`)
// const authorize = require(`${root}/middleware/authorize`);



setVisit = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const db = client.db("apolloHMS");
        const invoiceId = populateId();
        const uid = populateId();

        const createdAt = Date.now();
        const payload = req.body;
        payload.invoiceType = "visit"
        payload.uid = invoiceId;
        payload.createdAt = createdAt;

        const { patient, orgId, remark, paidAmount } = payload;
  
        const payment = {...req.body};
        payment.status = payment.doctorPayment;
        payment.billType = "visit";
        payment.uid = uid;
        payment.createdAt = createdAt;

        delete payment.invoiceType
        delete payment.paidAmount;
        delete payment.dueAmount;
        delete payload.doctorPayment;
        const account = {
            uid,
            invoiceId,
            userId: patient,
            type: "income",
            name: "Doctor Visit",
            orgId,
            description: remark,
            amount: paidAmount,
            createdAt,
            category:"outdoor"
        };

        const [visit] = await mongo.transaction([{ operation: insertOne, operationParameter: [db, "invoices", payload] }, { operation: insertOne, operationParameter: [db, "accounts", account] },{operation:insertOne,operationParameter:[db,"bills",payment]}],client);
        res.status(200).json({ success: !!visit, visit,});
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

getVisit = async (req, res, next) => {
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

        const visit = await mongo.fetchWithAggregation (
      
            db,
            "invoices",
            query,
            {
      
            },
            { createdAt: -1 },
          );
        res.status(200).json({ success: !!visit, visit: visit[0] });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

getVisits = async (req, res, next) => {
    const client = await mongoConnect();
    const { orgId, pagination, limit ,fromDate,toDate,doctorId,status} = req.query;
    try {

        const min = fromDate ? Date.parse(fromDate) : 0;
        let max = toDate ? Date.parse(toDate) : new Date().getTime();
        max = new Date(max).setHours(23, 59, 59, 999);
        let match = { orgId, invoiceType: "visit", 'createdAt': { '$gte': min, '$lte': max } };
        if (doctorId) match = { ...match, doctor: doctorId };
        if (status && status !=="all") match = { ...match,  status };
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
      
        const visits = await mongo.fetchWithAggregation(
            db,
            "invoices",
            query,
            {},
            { createdAt: -1 },
            Number(limit) || 10,
            Number(pagination) || 0
        );
        const total = await mongo.documentCount(db, "invoices", match);
        res.status(200).json({ success: !!visits, visits, total });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

updateVisit = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const payload = req.body;
        delete payload._id;
        const visit = await mongo.updateOne(
            db,
            "invoices",
            { uid, orgId },
            payload
        );
        res.status(200).json({ success: !!visit, visit });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

deleteVisit = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const visit = await mongo.deleteData(db, "invoices", { uid, orgId });
        res.status(200).json({ success: !!visit, visit });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

router.post("/visits", setVisit);
router.get("/visits/org/:orgId/:uid", getVisit);
router.get("/visits/org", getVisits);
router.put("/visits/org/:orgId/:uid", updateVisit);
router.delete("/visits/org/:orgId/:uid", deleteVisit);

module.exports = router;
