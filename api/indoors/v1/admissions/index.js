const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);
const { patient, doctor, anesthesia } = require(`${root}/services/populateQuery`)




postAdmission = async (req, res, next) => {
  const client = await mongoConnect();
  try {
    const db = client.db("apolloHMS");
    const payload = req.body;
    const { patient } = req.body;
    const getPatient = await mongo.fetchOne(db, "patients", { uid: patient });
    const today = new Date().toLocaleDateString();
    const patientName = getPatient.name.split(" ")[0];
    const admissionNo = patientName+ "-"+ today.replace(/\//g, "-");
    payload.admissionNo = admissionNo;
    const admission = await mongo.insertOne(db, "admissions", payload);
    res.status(200).json({ success: !!admission, admission });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

getOrgAdmission = async (req, res, next) => {
  const client = await mongoConnect();
  const { orgId, uid } = req.params;

  try {
    const patientLookUp = patient();
    const doctorLookUp = doctor();
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
      ...anesthesiaLookUp
    ]
    const db = client.db("apolloHMS");
    const admission = await mongo.fetchWithAggregation(

      db,
      "admissions",
      query,
      {

      },
      { createdAt: -1 },
    );
    res.status(200).json({ success: !!admission, admission: admission[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

getOrgAdmissions = async (req, res, next) => {
  const client = await mongoConnect();
  const { orgId, pagination, limit } = req.query;

  try {
    const patientLookUp = patient();
    const doctorLookUp = doctor();
    const anesthesiaLookUp = anesthesia();
    const query = [
      {
        '$match': {
          orgId
        }
      },
      ...patientLookUp,
      ...doctorLookUp,
      ...anesthesiaLookUp
    ]
    const db = client.db("apolloHMS");

    const admissions = await mongo.fetchWithAggregation(
      db,
      "admissions",
      query,
      { _id: 0, "patient._id": 0 },
      { createdAt: 1 },
      Number(limit) || 10,
      Number(pagination) || 0
    );
    const total = await mongo.documentCount(db, "admissions", { orgId });
    res.status(200).json({ success: !!admissions, admissions, total });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

admissionUpdate = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const payload = req.body;
    const admission = await mongo.updateOne(
      db,
      "admissions",
      { uid, orgId },
      payload
    );
    res.status(200).json({ success: !!admission, admission });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

admissionDelete = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const admission = await mongo.deleteData(db, "admissions", {
      uid,
      orgId,
    });
    res.status(200).json({ success: !!admission, admission });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};



router.post("/admissions", postAdmission)
router.get("/admissions/org/:orgId/:uid", getOrgAdmission);
router.get("/admissions/org", getOrgAdmissions);
router.put("/admissions/org/:orgId/:uid", admissionUpdate);
router.delete("/admissions/org/:orgId/:uid", admissionDelete);






module.exports = router;