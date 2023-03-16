const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);

// const authRoute = require(`${root}/middleware/authenticate`)
// const authorize = require(`${root}/middleware/authorize`);

patientReleaseCreate = async (req, res, next) => {
  const client = await mongoConnect();
  try {
    const db = client.db("apolloHMS");
    const payload = req.body;
    const release = await mongo.insertOne(db, "release-patient", payload);
    res.status(200).json({ success: !!release, release });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

getPatientRelease = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const release = await mongo.fetchOne(db, "release-patient", { uid });
    delete release.hospitals;
    res.status(200).json({ success: !!release, release });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

getOrgPatientsRelease = async (req, res, next) => {
  const client = await mongoConnect();
  const { orgId, pagination, limit, fromDate, toDate, } = req.query;
  try {
    const db = client.db("apolloHMS");
    const min = fromDate ? Date.parse(fromDate) : 0;
    let max = toDate  ? Date.parse(toDate) : new Date().getTime();
    max = new Date(max).setHours(23, 59, 59, 999);
    let query = { orgId, };
    const release = await mongo.fetchWithAggregation(
      db,
      "release-patient",
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
    const total = await mongo.documentCount(db, "release-patient", query);
    res.status(200).json({ success: !!release, release, total });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

patientReleaseUpdate = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const payload = req.body;
    const release = await mongo.updateOne(
      db,
      "release-patient",
      { uid, orgId },
      payload
    );
    res.status(200).json({ success: !!release, release });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

patientReleaseDelete = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const release = await mongo.deleteData(db, "release-patient", {
      uid,
      orgId,
    });
    res.status(200).json({ success: !!release, release });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

router.post("/patient/release", patientReleaseCreate);
router.get("/patient/release/org/:orgId/:uid", getPatientRelease);
router.get("/patient/release/org", getOrgPatientsRelease);
router.put("/patient/release/org/:orgId/:uid", patientReleaseUpdate);
router.delete("/patient/release/org/:orgId/:uid", patientReleaseDelete);

module.exports = router;
