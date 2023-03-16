const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);


testCreate = async (req, res, next) => {
  const client = await mongoConnect();
  try {

    const db = client.db("apolloHMS");
    const test = await mongo.insertOne(db, "tests", req.body);
    res.status(200).json({ success: !!test, test });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

getOrgTest = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const test = await mongo.fetchOne(db, "tests", {
      uid,
      orgId,
    });
    delete test._id;
    res.status(200).json({ success: !!test, test });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

getOrgTests = async (req, res, next) => {
  const client = await mongoConnect();
  const { orgId } = req.query;
  try {
    const db = client.db("apolloHMS");
    const tests = await mongo.fetchWithoutpagination(
      db,
      "tests",
      { orgId },
      { _id: 0 },
      {},
    );
    const total = await mongo.documentCount(db, "tests", { orgId });
    res.status(200).json({ success: !!tests, tests, total });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

testUpdate = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const payload = req.body;
    delete payload._id;
    const test = await mongo.updateOne(db, "tests", { uid, orgId }, payload);
    res.status(200).json({ success: !!test, test });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

testDelete = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const test = await mongo.deleteData(db, "tests", {
      uid,
      orgId,
    });
    res.status(200).json({ success: !!test, test });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

router.post("/tests", testCreate);
router.get("/tests/org/:orgId/:uid", getOrgTest);
router.get("/tests/org", getOrgTests);
router.put("/tests/org/:orgId/:uid", testUpdate);
router.delete("/tests/org/:orgId/:uid", testDelete);

module.exports = router;
