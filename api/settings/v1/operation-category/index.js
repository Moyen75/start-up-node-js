const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);

operationCetegoryCreate = async (req, res, next) => {
  const client = await mongoConnect();
  try {

    const db = client.db("apolloHMS");
    const payload = req.body;
    const category = await mongo.insertOne(db, "category-settings", payload);
    res.status(200).json({ success: !!category, category });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

getOrgcategory = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const category = await mongo.fetchOne(db, "category-settings", {
      uid,
      orgId,
    });
    res.status(200).json({ success: !!category, category });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};
categoryUpdate = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const payload = req.body;

    const category = await mongo.updateOne(
      db,
      "category-settings",
      { uid, orgId },
      payload
    );
    res.status(200).json({ success: !!category, category });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

categoryDelete = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const category = await mongo.deleteData(db, "category-settings", {
      uid,
      orgId,
    });
    res.status(200).json({ success: !!category, category });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

router.post("/operations/categories", operationCetegoryCreate);
router.get("/operations/categories/org/:orgId/:uid", getOrgcategory);
router.put("/operations/categories/org/:orgId/:uid", categoryUpdate);
router.delete("/operations/categories/org/:orgId/:uid", categoryDelete);

module.exports = router;
