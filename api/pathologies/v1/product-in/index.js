const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);
const { product, supplier } = require(`${root}/services/populateQuery`);

createProduct = async (req, res, next) => {
  const client = await mongoConnect();
  try {
    const db = client.db("apolloHMS");
    const product = await mongo.insertOne(db, "product-in", req.body);
    res.status(200).json({ success: !!product, product });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

fetchProduct = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const productLookup = product();
    const supplierLookup = supplier();
    const match = [
      {
        '$match': {
          orgId, uid
        }
      },
      ...productLookup,
      ...supplierLookup
    ]
    const singleProduct = await mongo.fetchWithAggregation(
      db,
      "product-in",
      match,
      {},
      { createdAt: 1 });
    res.status(200).json({ success: !!singleProduct, product: singleProduct[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

fetchProducts = async (req, res, next) => {
  const client = await mongoConnect();
  const { orgId, pagination, limit } = req.query;
  try {
    const db = client.db("apolloHMS");
    const productLookup = product();
    const supplierLookup = supplier();
    const match = [
      {
        '$match': {
          orgId
        }
      },
      ...productLookup,
      ...supplierLookup
    ]
    const products = await mongo.fetchWithAggregation(
      db,
      "product-in",
      match,
      {},
      { createdAt: 1 },
      Number(limit) || 10,
      Number(pagination) || 0
    );
    const total = await mongo.documentCount(db, "product-in", { orgId });
    res.status(200).json({ success: !!products, products, total });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
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
    delete payload._id;
    const product = await mongo.updateOne(
      db,
      "product-in",
      { uid, orgId },
      payload
    );
    res.status(200).json({ success: !!product, product });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

deleteProduct = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const product = await mongo.deleteData(db, "product-in", {
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

router.post("/product-in", createProduct);
router.get("/product-in/org/:orgId/:uid", fetchProduct);
router.get("/product-in/org", fetchProducts);
router.put("/product-in/org/:orgId/:uid", updateProduct);
router.delete("/product-in/org/:orgId/:uid", deleteProduct);

module.exports = router;
