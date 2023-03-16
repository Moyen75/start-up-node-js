const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);


// const authRoute = require(`${root}/middleware/authenticate`);
// const authorize = require(`${root}/middleware/authorize`);

setExpense = async (req, res, next) => {
  const client = await mongoConnect();
  try {

    const db = client.db("apolloHMS");
    const payload = req.body;

    const expense = await mongo.insertOne(db, "expense-settings", payload);
    res.status(200).json({ success: !!expense, expense });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await client.close();
  }
};

getExpense = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;

  try {
    const db = client.db("apolloHMS");
    const expense = await mongo.fetchOne(db, "expense-settings", { uid, orgId });
    res.status(200).json({ success: !!expense, expense });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await client.close();
  }
};
updateExpense = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;

  try {
    const db = client.db("apolloHMS");
    const payload = req.body;

    const expense = await mongo.updateOne(
      db,
      "expense-settings",
      { orgId, uid, },
      payload
    );
    res.status(200).json({ success: !!expense, expense });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await client.close();
  }
};

expenseDelete = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const expense = await mongo.deleteData(db, "expense-settings", {
      uid,
      orgId,
    });
    res.status(200).json({ success: !!expense, expense });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};
router.post("/expenses", setExpense);
router.get("/expenses/org/:orgId/:uid", getExpense);
router.put("/expenses/org/:orgId/:uid", updateExpense);
router.delete("/expenses/org/:orgId/:uid", expenseDelete);

module.exports = router;
