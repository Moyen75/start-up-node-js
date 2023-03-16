const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);
const {patient,doctor,referredBy,anesthesia} = require(`${root}/services/populateQuery`)


setOperation = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const db = client.db("apolloHMS");
        const operation = await mongo.insertOne(db, "operation-payments", req.body)
        res.status(200).json({ success: !!operation, operation });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};
getOperation = async (req, res, next) => {
    const client = await mongoConnect();
    const { orgId,uid  } = req.params;

    try {
        const patientLookUp = patient();
        const doctorLookUp = doctor();
        const referredByLookUp = referredBy();
        const anesthesiaLookUp = anesthesia();


        const query = [
            {
                '$match': {
                    orgId,
                    uid
                }
            }, 
             ...patientLookUp,
             ...doctorLookUp,
             ...referredByLookUp,
             ...anesthesiaLookUp,
           
        ]
        const db = client.db("apolloHMS");
        const operation = await mongo.fetchWithAggregation (
          
          db,
          "operation-payments",
          query,
          {
    
          },
          { createdAt: -1 },
        );
        res.status(200).json({ success: !!operation, operation:operation[0] });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
getOperations = async (req, res, next) => {
    const client = await mongoConnect();
    const { orgId, pagination, limit } = req.query;

    try {
        const patientLookUp = patient();
        const doctorLookUp = doctor();
        const referredByLookUp = referredBy();
        const anesthesiaLookUp = anesthesia();
        const query = [
            {
                '$match': {
                    orgId
                }
            }, 
             ...patientLookUp,
             ...doctorLookUp,
             ...referredByLookUp,
             ...anesthesiaLookUp,
            
        ]
        const db = client.db("apolloHMS");
        const operations = await mongo.fetchWithAggregation(
            db,
            "operation-payments",
            query,
            {
            
            },
            { createdAt: -1 },
            Number(limit) || 10,
            Number(pagination) || 0
        );
        const total = await mongo.documentCount(db, "operation-payments", { orgId })
        res.status(200).json({ success: !!operations, operations, total });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
updateOperation = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const operation = await mongo.updateOne(db, "operation-payments", { orgId, uid }, req.body);
        res.status(200).json({ success: !!operation, operation });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
deleteOperation = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const operation = await mongo.deleteData(db, "operation-payments", { orgId, uid }, req.body);
        res.status(200).json({ success: !!operation, operation });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}


router.post("/operations", setOperation)
router.get("/operations/org", getOperations)
router.get("/operations/org/:orgId/:uid", getOperation)
router.put("/operations/org/:orgId/:uid", updateOperation);
router.delete("/operations/org/:orgId/:uid", deleteOperation);

module.exports = router;


