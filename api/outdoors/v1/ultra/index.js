const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);
const {
  doctor,
  organizations,
  expense,
} = require(`${root}/services/populateQuery`);

// const authRoute = require(`${root}/middleware/authenticate`)
// const authorize = require(`${root}/middleware/authorize`);

setUltra = async (req, res, next) => {
  const client = await mongoConnect();
  try {
    const db = client.db("apolloHMS");
    const payload = req.body;
    const ultra = await mongo.insertOne(db, "ultra", payload);
    res.status(200).json({ success: !!ultra, ultra });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

getUltra = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const doctorLookUp = doctor();
    const organizationsLookUp = organizations();
    const expenseLookUp = expense();
    const query = [
      {
        $match: {
          orgId,
          uid,
        },
      },
      ...doctorLookUp,
      ...organizationsLookUp,
      ...expenseLookUp,
    ];
    const db = client.db("apolloHMS");
    const ultra = await mongo.fetchWithAggregation(
      db,
      "ultra",
      query,
      {},
      { createdAt: -1 }
    );

    res.status(200).json({ success: !!ultra, ultra: ultra[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

getUltras = async (req, res, next) => {
  const client = await mongoConnect();
  const { orgId, pagination, limit,doctorId } = req.query;
  try {
    const doctorLookUp = doctor();
    const organizationsLookUp = organizations();
    const expenseLookUp = expense();
    let match = { orgId };
    if (doctorId) match = { orgId, doctor: doctorId };
    const query = [
      {
        "$match": match
      },
      ...doctorLookUp,
      ...organizationsLookUp,
      ...expenseLookUp,
    ];
    const db = client.db("apolloHMS");

    const ultra = await mongo.fetchWithAggregation(
      db,
      "ultra",
      query,
      {},
      { createdAt: -1 },
      Number(limit) || 10,
      Number(pagination) || 0
    );

    const total = await mongo.documentCount(db, "ultra", match);

    res.status(200).json({ success: !!ultra, ultra, total });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

updateUltra = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const payload = req.body;
    const ultra = await mongo.updateOne(db, "ultra", { uid, orgId }, payload);
    res.status(200).json({ success: !!ultra, ultra });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

deleteUltra = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const ultra = await mongo.deleteData(db, "ultra", { uid, orgId });
    res.status(200).json({ success: !!ultra, ultra });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

router.post("/ultra", setUltra);
router.get("/ultra/org/:orgId/:uid", getUltra);
router.get("/ultra/org", getUltras);
router.put("/ultra/org/:orgId/:uid", updateUltra);
router.delete("/ultra/org/:orgId/:uid", deleteUltra);

module.exports = router;
