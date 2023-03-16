const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);


bedCreate = async (req, res, next) => {
  const client = await mongoConnect();
  try {

    const db = client.db("apolloHMS");
    const payload = req.body;
    const bed = await mongo.insertOne(db, "bed-settings", payload);
    res.status(200).json({ success: !!bed, bed });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

getOrgBed = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const bed = await mongo.fetchOne(db, "bed-settings", { uid, orgId });
    res.status(200).json({ success: !!bed, bed });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};
bedUpdate = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const payload = req.body;

    const bed = await mongo.updateOne(db, "bed-settings", { uid, orgId }, payload);
    res.status(200).json({ success: !!bed, bed });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

bedDelete = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const bed = await mongo.deleteData(db, "bed-settings", { uid, orgId });
    res.status(200).json({ success: !!bed, bed });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

router.post("/beds", bedCreate);
router.get("/beds/org/:orgId/:uid", getOrgBed);
router.put("/beds/org/:orgId/:uid", bedUpdate);
router.delete("/beds/org/:orgId/:uid", bedDelete);

module.exports = router;
