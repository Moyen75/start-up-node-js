const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);


// const authRoute = require(`${root}/middleware/authenticate`);
// const authorize = require(`${root}/middleware/authorize`);

setProduct = async (req, res, next) => {
  const client = await mongoConnect();
  try {

    const db = client.db("apolloHMS");
    const payload = req.body;
    const product = await mongo.insertOne(db, "product-settings", payload);
    res.status(200).json({ success: !!product, product });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await client.close();
  }
};

getProduct = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;

  try {
    const db = client.db("apolloHMS");
    const product = await mongo.fetchOne(db, "product-settings", { orgId, uid, });
    res.status(200).json({ success: !!product, product });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await client.close();
  }
};
updateProduct = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;

  try {
    const db = client.db("apolloHMS");
    const payload = req.body;

    const product = await mongo.updateOne(
      db,
      "product-settings",
      { orgId, uid, },
      payload
    );
    res.status(200).json({ success: !!product, product });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await client.close();
  }
};

deleteProduct = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const product = await mongo.deleteData(db, "product-settings", {
      uid,
      orgId,
    });
    res.status(200).json({ success: !!product, product });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

router.post("/lab-products", setProduct);
router.get("/lab-products/org/:orgId/:uid", getProduct);
router.put("/lab-products/org/:orgId/:uid", updateProduct);
router.delete("/lab-products/org/:orgId/:uid", deleteProduct);

module.exports = router;
