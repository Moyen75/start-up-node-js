const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);


// const authRoute = require(`${root}/middleware/authenticate`);
// const authorize = require(`${root}/middleware/authorize`);

setDesignation = async (req, res, next) => {
  const client = await mongoConnect();
  try {

    const db = client.db("apolloHMS");
    const payload = req.body;
    const designation = await mongo.insertOne(db, "designation-settings", payload);
    res.status(200).json({ success: !!designation, designation });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await client.close();
  }
};

getDesignation = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;

  try {
    const db = client.db("apolloHMS");
    const designation = await mongo.fetchOne(db, "designation-settings", {
      uid,
      orgId,
    });
    res.status(200).json({ success: !!designation, designation });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await client.close();
  }
};
updateDesignation = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;

  try {
    const db = client.db("apolloHMS");
    const payload = req.body;
    const designation = await mongo.updateOne(
      db,
      "designation-settings",
      { orgId, uid, },
      payload
    );
    res.status(200).json({ success: !!designation, designation });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await client.close();
  }
};

designationDelete = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const designation = await mongo.deleteData(db, "designation-settings", {
      uid,
      orgId,
    });
    res.status(200).json({ success: !!designation, designation });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

router.post("/designations", setDesignation);
router.get("/designations/org/:orgId/:uid", getDesignation);
router.put("/designations/org/:orgId/:uid", updateDesignation);
router.delete("/designations/org/:orgId/:uid", designationDelete);

module.exports = router;
