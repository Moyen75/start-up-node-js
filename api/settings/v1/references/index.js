const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);


// const authRoute = require(`${root}/middleware/authenticate`);
// const authorize = require(`${root}/middleware/authorize`);

setReference = async (req, res, next) => {
  const client = await mongoConnect();
  try {
    const db = client.db("apolloHMS");
    const payload = req.body;
    const { username } = payload;
    const isUsernameExists = await mongo.documentExists(db, "reference-settings", { username });
    if (isUsernameExists) return res.status(200).json({ success: false, message: "Username Already Exists!" })
    const reference = await mongo.insertOne(db, "reference-settings", payload);
    res.status(200).json({ success: !!reference, reference });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await client.close();
  }
};

getReference = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const reference = await mongo.fetchOne(db, "reference-settings", {
      orgId,
      uid,
    });
    res.status(200).json({ success: !!reference, reference });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await client.close();
  }
};
updateReference = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const payload = req.body;
    const reference = await mongo.updateOne(
      db,
      "reference-settings",
      { orgId, uid, },
      payload
    );
    res.status(200).json({ success: !!reference, reference });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await client.close();
  }
};

deleteReference = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const reference = await mongo.deleteData(db, "reference-settings", {
      uid,
      orgId,
    });
    res.status(200).json({ success: !!reference, reference });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

router.post("/references", setReference);
router.get("/references/org/:orgId/:uid", getReference);
router.put("/references/org/:orgId/:uid", updateReference);
router.delete("/references/org/:orgId/:uid", deleteReference);

module.exports = router;
