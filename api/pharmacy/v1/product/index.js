const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);

createProduct = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const db = client.db("apolloHMS");
        const product = await mongo.insertOne(db, "product", req.body);
        res.status(200).json({ success: !!product, product });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

getOrgProduct = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const product = await mongo.fetchOne(db, "product", {
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

getOrgProducts = async (req, res, next) => {
    const client = await mongoConnect();
    const { orgId, pagination, limit } = req.query;
    try {
        const db = client.db("apolloHMS");
        const products = await mongo.fetchMany(
            db,
            "product",
            { orgId },
            {},
            {},
            Number(limit) || 10,
            Number(pagination) || 0
        );
        const total = await mongo.documentCount(db, "product", { orgId });
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
            "product",
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
        const product = await mongo.deleteData(db, "product", {
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

router.post("/product", createProduct);
router.get("/product/org/:orgId/:uid", getOrgProduct);
router.get("/product/org", getOrgProducts);
router.put("/product/org/:orgId/:uid", updateProduct);
router.delete("/product/org/:orgId/:uid", deleteProduct);

module.exports = router;
