const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);



supplierCreate = async (req, res, next) => {
  const client = await mongoConnect();
  try {

    const db = client.db("apolloHMS");
    const payload = req.body;
    const supplier = await mongo.insertOne(db, "supplier-settings", payload);
    res.status(200).json({ success: !!supplier, supplier });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

getOrgSupplier = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const supplier = await mongo.fetchOne(db, "supplier-settings", {
      uid,
      orgId,
    });
    res.status(200).json({ success: !!supplier, supplier });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};
supplierUpdate = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const payload = req.body;

    const supplier = await mongo.updateOne(
      db,
      "supplier-settings",
      { uid, orgId },
      payload
    );
    res.status(200).json({ success: !!supplier, supplier });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

supplierDelete = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const supplier = await mongo.deleteData(db, "supplier-settings", {
      uid,
      orgId,
    });
    res.status(200).json({ success: !!supplier, supplier });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

router.post("/suppliers", supplierCreate);
router.get("/suppliers/org/:orgId/:uid", getOrgSupplier);
router.put("/suppliers/org/:orgId/:uid", supplierUpdate);
router.delete("/suppliers/org/:orgId/:uid", supplierDelete);

module.exports = router;
