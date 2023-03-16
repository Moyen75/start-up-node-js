const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);
const { product } = require(`${root}/services/populateQuery`)





setProduct = async (req, res, next) => {
  const client = await mongoConnect();
  try {

    const db = client.db("apolloHMS");
    const product = await mongo.insertOne(db, "product-out", req.body);
    res.status(200).json({ success: !!product, product });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

getProduct = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const productLookUp = product();

    const query = [
      {
        '$match': {
          orgId,
          uid
        }
      },
      ...productLookUp,

    ]
    const db = client.db("apolloHMS");

    const product = await mongo.fetchWithAggregation(

      db,
      "product-out",
      query,
      {

      },
      { createdAt: -1 },
    );
    res.status(200).json({ success: !!product, product: product[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

getProducts = async (req, res, next) => {
  const client = await mongoConnect();
  const { orgId, pagination, limit } = req.query;
  try {
    const productLookUp = product()

    const query = [
      {
        '$match': {
          orgId
        }
      },
      ...productLookUp,

    ]
    const db = client.db("apolloHMS");
    const products = await mongo.fetchWithAggregation(
      db,
      "product-out",
      query,
      {

      },
      { createdAt: -1 },
      Number(limit) || 10,
      Number(pagination) || 0
    );
    const total = await mongo.documentCount(db, "product-out", { orgId });
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
      "product-out",
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
    const product = await mongo.deleteData(db, "product-out", {
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

router.post("/product-out", setProduct);
router.get("/product-out/org/:orgId/:uid", getProduct);
router.get("/product-out/org", getProducts);
router.put("/product-out/org/:orgId/:uid", updateProduct);
router.delete("/product-out/org/:orgId/:uid", deleteProduct);

module.exports = router;
