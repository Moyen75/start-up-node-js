const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);
const { doctor, patient } = require(`${root}/services/populateQuery`);

createResult = async (req, res, next) => {
  const client = await mongoConnect();
  try {

    const db = client.db("apolloHMS");
    const result = await mongo.insertOne(db, "test-results", req.body);
    if (result) {
      const { tests, invoiceNo,reportingDate ,specimenDate} = result;
      for (let test of tests) {
        await mongo.updateOne(db, "test-reports", { testId: test.uid, invoiceId: invoiceNo }, { status: "complete", result: test, reportingDate ,specimenDate});
      }
    }
    res.status(200).json({ success: !!result, result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

getResult = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const doctorLookup = doctor();
    const patientLookup = patient();
    const query = [
      {
        "$match": {
          uid, orgId
        }
      },
      ...doctorLookup,
      ...patientLookup
    ]
    const db = client.db("apolloHMS");
    const result = await mongo.fetchWithAggregation(db, "test-results", query, {}, { createdAt: 1 });
    res.status(200).json({ success: !!result, result: result[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

getResults = async (req, res, next) => {
  const client = await mongoConnect();
  const { orgId, pagination, limit, status,reportType } = req.query;
  try {
    let query = { orgId }
    if (status) query = { ...query, status };
    if (reportType) query = { ...query, reportType };
    const doctorLookup = doctor();
    const patientLookup = patient();
    const match = [
      {
        '$match': query
      },
      ...doctorLookup,
      ...patientLookup,
    ]
    const db = client.db("apolloHMS");
    const results = await mongo.fetchWithAggregation(
      db,
      "test-results",
      match,
      {},
      { createdAt: 1 },
      Number(limit) || 10,
      Number(pagination) || 0
    );
    const total = await mongo.documentCount(db, "test-results", query);
    res.status(200).json({ success: !!results, results, total });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

updateResult = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const payload = req.body;
    const result = await mongo.updateOne(
      db,
      "test-results",
      { uid, orgId },
      payload
    );
    res.status(200).json({ success: !!result, result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

deleteResult = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const result = await mongo.deleteData(db, "test-results", {
      uid,
      orgId,
    });
    res.status(200).json({ success: !!result, result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

router.post("/tests/results", createResult);
router.get("/tests/results/org/:orgId/:uid", getResult);
router.get("/tests/results/org", getResults);
router.put("/tests/results/org/:orgId/:uid", updateResult);
router.delete("/tests/results/org/:orgId/:uid", deleteResult);

module.exports = router;
