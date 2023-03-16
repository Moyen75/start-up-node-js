const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);


specialistCreate = async (req, res, next) => {
  const client = await mongoConnect();
  try {

    const db = client.db("apolloHMS");
    const payload = req.body;
    const specialist = await mongo.insertOne(db, "specialist-settings", payload);
    res.status(200).json({ success: !!specialist, specialist });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

getOrgSpecialist = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const specialist = await mongo.fetchOne(db, "specialist-settings", {
      uid,
      orgId,
    });
    res.status(200).json({ success: !!specialist, specialist });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};
specialistUpdate = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;

  try {
    const db = client.db("apolloHMS");
    const payload = req.body;

    const specialist = await mongo.updateOne(
      db,
      "specialist-settings",
      { uid, orgId },
      payload
    );
    res.status(200).json({ success: !!specialist, specialist });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

specialistDelete = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const specialist = await mongo.deleteData(db, "specialist-settings", {
      uid,
      orgId,
    });
    res.status(200).json({ success: !!specialist, specialist });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

router.post("/specialists", specialistCreate);
router.get("/specialists/org/:orgId/:uid", getOrgSpecialist);
router.put("/specialists/org/:orgId/:uid", specialistUpdate);
router.delete("/specialists/org/:orgId/:uid", specialistDelete);

module.exports = router;
