const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);

// const authRoute = require(`${root}/middleware/authenticate`)
// const authorize = require(`${root}/middleware/authorize`);

patientCreate = async (req, res, next) => {
  const client = await mongoConnect();
  try {
    const db = client.db("apolloHMS");
    const payload = req.body;
    const patient = await mongo.insertOne(db, "patients", payload);
    res.status(200).json({ success: !!patient, patient });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

getPatient = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const patient = await mongo.fetchOne(db, "patients", { uid });
    delete patient.hospitals;
    res.status(200).json({ success: !!patient, patient });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

getOrgPatients = async (req, res, next) => {
  const client = await mongoConnect();
  const { orgId, pagination, limit, fromDate, toDate, type, status } = req.query;
  try {
    const db = client.db("apolloHMS");
    const min = fromDate ? Date.parse(fromDate) : 0;
    let max = toDate  ? Date.parse(toDate) : new Date().getTime();
    max = new Date(max).setHours(23, 59, 59, 999);
    let query = { orgId, "createdAt": { "$gte": min, "$lte": max } };
    if (type) query = { ...query, type };
    if (status) query = { ...query, status }
    const patients = await mongo.fetchWithAggregation(
      db,
      "patients",
      [
        {
          "$match": query
        }
      ],
      {},
      { createdAt: 1 },
      Number(limit) || 10,
      Number(pagination) || 0
    );
    const total = await mongo.documentCount(db, "patients", query);
    res.status(200).json({ success: !!patients, patients, total });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

patientUpdate = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const payload = req.body;
    const patient = await mongo.updateOne(
      db,
      "patients",
      { uid, orgId },
      payload
    );
    res.status(200).json({ success: !!patient, patient });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

pasientDelete = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const patients = await mongo.deleteData(db, "patients", {
      uid,
      orgId,
    });
    res.status(200).json({ success: !!patients, patients });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

router.post("/patients", patientCreate);
router.get("/patients/org/:orgId/:uid", getPatient);
router.get("/patients/org", getOrgPatients);
router.put("/patients/org/:orgId/:uid", patientUpdate);
router.delete("/patients/org/:orgId/:uid", pasientDelete);

module.exports = router;
