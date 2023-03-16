const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);

getExpenditure = async (req, res, next) => {
  const client = await mongoConnect();
  try {
    const db = client.db("apolloHMS");
    const expenditure = await mongo.insertOne(db, "indoor-expenditures", req.body);
    res.status(200).json({ success: !!expenditure, expenditure });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

getOrgExpenditure = async (req, res, next) => {
  const client = await mongoConnect();
  try {
    const { orgId, invoiceId } = req.params;
    const db = client.db("apolloHMS");
    const expenditure = await mongo.fetchOne(db, "indoor-expenditures", {
      invoiceId,
      orgId,
    });
    res.status(200).json({ success: !!expenditure, expenditure });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

getOrgExpenditures = async (req, res, next) => {
  const client = await mongoConnect();
  try {
    const { orgId, pagination, limit } = req.query;
    const db = client.db("apolloHMS");
    const expenditure = await mongo.fetchMany(
      db,
      "indoor-expenditures",
      { orgId },
      {},
      {},
      Number(limit) || 10,
      Number(pagination) || 0
    );
    const total = await mongo.documentCount(db, "indoor-expenditures", { orgId });
    res.status(200).json({ success: !!expenditure, expenditure, total });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

expenditureUpdate = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const payload = req.body;
    const expenditure = await mongo.updateOne(
      db,
      "indoor-expenditures",
      { uid, orgId },
      payload
    );
    res.status(200).json({ success: !!expenditure, expenditure });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

expenditureDelete = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const expenditure = await mongo.deleteData(db, "indoor-expenditures", {
      uid,
      orgId,
    });
    res.status(200).json({ success: !!expenditure, expenditure });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};



router.post("/expenditures", getExpenditure);
router.get("/expenditures/org/:orgId/:uid", getOrgExpenditure);
router.get("/expenditures/org", getOrgExpenditures);
router.put("/expenditures/org/:orgId/:uid", expenditureUpdate);
router.delete("/expenditures/org/:orgId/:uid", expenditureDelete);
module.exports = router;