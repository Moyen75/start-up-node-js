const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);


// const authRoute = require(`${root}/middleware/authenticate`);
// const authorize = require(`${root}/middleware/authorize`);

setIncomeHead = async (req, res, next) => {
  const client = await mongoConnect();
  try {

    const db = client.db("apolloHMS");
    const payload = req.body;
    const incomeHead = await mongo.insertOne(db, "incomeHead-settings", payload);
    res.status(200).json({ success: !!incomeHead, incomeHead });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await client.close();
  }
};

getIncomeHead = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;

  try {
    const db = client.db("apolloHMS");

    const incomeHead = await mongo.fetchOne(db, "incomeHead-settings", {
      orgId,
      uid,
    });
    res.status(200).json({ success: !!incomeHead, incomeHead });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await client.close();
  }
};
updateIncomeHead = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const payload = req.body;
    const incomeHead = await mongo.updateOne(
      db,
      "incomeHead-settings",
      { orgId, uid, },
      payload
    );
    res.status(200).json({ success: !!incomeHead, incomeHead });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await client.close();
  }
};

incomeHeadDelete = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const incomeHead = await mongo.deleteData(db, "incomeHead-settings", {
      uid,
      orgId,
    });
    res.status(200).json({ success: !!incomeHead, incomeHead });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

router.post("/income-heads", setIncomeHead);
router.get("/income-heads/org/:orgId/:uid", getIncomeHead);
router.put("/income-heads/org/:orgId/:uid", updateIncomeHead);
router.delete("/income-heads/org/:orgId/:uid", incomeHeadDelete);

module.exports = router;
