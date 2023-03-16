const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);
const { doctorApi } = require(`${root}/services/populateQuery`)
doctorCreate = async (req, res, next) => {
  const client = await mongoConnect();
  try {
    const db = client.db("apolloHMS");
    const payload = req.body;
    doctor = await mongo.insertOne(db, "doctors", payload);
    delete doctor._id;
    res.status(200).json({ success: !!doctor, doctor });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

getOrgDoctor = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const lookups = doctorApi()
    const query = [
      {
        "$match": {
          uid, orgId
        }
      },
      ...lookups
    ]
    const doctor = await mongo.fetchWithAggregation(db, "doctors", query, {}, { createdAt: 1 });
    res.status(200).json({ success: !!doctor, doctor: doctor[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

getOrgDoctors = async (req, res, next) => {
  const client = await mongoConnect();
  const { orgId, pagination, limit } = req.query;
  try {
    const db = client.db("apolloHMS");
    const lookups = doctorApi();
    const query = [
      {
        "$match": {
          orgId
        }
      },
      ...lookups
    ]
    const doctors = await mongo.fetchWithAggregation(
      db,
      "doctors",
      query,
      {},
      { createdAt: 1 },
      Number(limit) || 10,
      Number(pagination) || 0
    );
    const total = await mongo.documentCount(db, "doctors", { orgId });
    res.status(200).json({ success: !!doctors, doctors, total });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

doctorsUpdate = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const payload = req.body;
    const doctor = await mongo.updateOne(
      db,
      "doctors",
      { uid, orgId },
      payload
    );
    res.status(200).json({ success: !!doctor, doctor });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

doctorDelete = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const doctor = await mongo.deleteData(db, "doctors", { uid, orgId });
    res.status(200).json({ success: !!doctor, doctor });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

router.post("/doctors", doctorCreate);
router.get("/doctors/org/:orgId/:uid", getOrgDoctor);
router.get("/doctors/org", getOrgDoctors);
router.put("/doctors/org/:orgId/:uid", doctorsUpdate);
router.delete("/doctors/org/:orgId/:uid", doctorDelete);

module.exports = router;
