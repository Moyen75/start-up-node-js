const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);
const {patient,doctor} =  require (`${root}/services/populateQuery`)



// const authRoute = require(`${root}/middleware/authenticate`)
// const authorize = require(`${root}/middleware/authorize`);



setSerial = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const db = client.db("apolloHMS");
        const payload = req.body
        const serial = await mongo.insertSerial(db, "serials", payload);
        res.status(200).json({ success: !!serial, serial });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

getSerial = async (req, res, next) => {
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

        const serial = await mongo.fetchWithAggregation (
      
            db,
            "serials",
            query,
            {
      
            },
            { createdAt: -1 },
          );
        res.status(200).json({ success: !!serial, serial: serial[0] });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

getSerials = async (req, res, next) => {
    const client = await mongoConnect();
    const { orgId, pagination, limit } = req.query;
    try {
        const patientLookUp = patient();
        const doctorLookUp = doctor();
        const query = [
            {
                '$match': {
                    orgId
                }
            }, 
            ...patientLookUp,
            ...doctorLookUp,
           
        ]
        const db = client.db("apolloHMS");
      
        const serials = await mongo.fetchWithAggregation(
            db,
            "serials",
            query,
            {},
            { createdAt: -1 },
            Number(limit) || 10,
            Number(pagination) || 0
        );
       
        const total = await mongo.documentCount(db, "serials", { orgId });
        res.status(200).json({ success: !!serials, serials, total });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

updateSerial = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const payload = req.body;
        const serial = await mongo.updateOne(
            db,
            "serials",
            { uid, orgId },
            payload
        );
        res.status(200).json({ success: !!serial, serial });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

deleteSerial = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const serial = await mongo.deleteData(db, "serials", { uid, orgId });
        res.status(200).json({ success: !!serial, serial });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

router.post("/serials", setSerial);
router.get("/serials/org/:orgId/:uid", getSerial);
router.get("/serials/org", getSerials);
router.put("/serials/org/:orgId/:uid", updateSerial);
router.delete("/serials/org/:orgId/:uid", deleteSerial);

module.exports = router;
