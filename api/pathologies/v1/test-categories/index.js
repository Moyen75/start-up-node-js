const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);


setTestCategory = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const db = client.db("apolloHMS");
        const category = await mongo.insertOne(db, "test-categories", req.body);
        res.status(200).json({ success: !!category, category });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

getTestCategory = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const category = await mongo.fetchOne(db, "test-categories", { uid, orgId });
        res.status(200).json({ success: !!category, category });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

getTestCategories = async (req, res, next) => {
    const client = await mongoConnect();
    const { orgId } = req.query;
    try {
        const db = client.db("apolloHMS");
        const categories = await mongo.fetchWithoutpagination(
            db,
            "test-categories",
            { orgId },
            {},
            {},
        );
        const total = await mongo.documentCount(db, "test-categories", { orgId });
        res.status(200).json({ success: !!categories, categories, total });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

testCategoryUpdate = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const payload = req.body;
        delete payload._id;
        const category = await mongo.updateOne(
            db,
            "test-categories",
            { uid, orgId },
            payload
        );
        res.status(200).json({ success: !!category, category });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

testCategoryDelete = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const category = await mongo.deleteData(db, "test-categories", {
            uid,
            orgId,
        });
        res.status(200).json({ success: !!category, category });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

router.post("/tests/categories", setTestCategory);
router.get("/tests/categories/org/:orgId/:uid", getTestCategory);
router.get("/tests/categories/org", getTestCategories);
router.put("/tests/categories/org/:orgId/:uid", testCategoryUpdate);
router.delete("/tests/categories/org/:orgId/:uid", testCategoryDelete);

module.exports = router;
