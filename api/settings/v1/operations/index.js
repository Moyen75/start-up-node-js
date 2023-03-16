const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);


operationCreate = async (req, res, next) => {
  const client = await mongoConnect();
  try {

    const db = client.db("apolloHMS");
    const payload = req.body;
    const operation = await mongo.insertOne(db, "operation-settings", payload);
    res.status(200).json({ success: !!operation, operation });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

getOrgOperation = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const operation = await mongo.fetchOne(db, "operation-settings", {
      uid,
      orgId,
    });
    res.status(200).json({ success: !!operation, operation });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};
operationUpdate = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const payload = req.body;

    const operation = await mongo.updateOne(
      db,
      "operation-settings",
      { uid, orgId },
      payload
    );
    res.status(200).json({ success: !!operation, operation });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

operationDelete = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const operation = await mongo.deleteData(db, "operation-settings", {
      uid,
      orgId,
    });
    res.status(200).json({ success: !!operation, operation });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

router.post("/operations", operationCreate);
router.get("/operations/org/:orgId/:uid", getOrgOperation);
router.put("/operations/org/:orgId/:uid", operationUpdate);
router.delete("/operations/org/:orgId/:uid", operationDelete);

module.exports = router;
