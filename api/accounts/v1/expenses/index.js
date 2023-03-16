const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);


setExpense = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const db = client.db("apolloHMS");
        const expense = await mongo.insertOne(db, "expenses", req.body);
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
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const expense = await mongo.fetchOne(db, "expenses", { orgId, uid });
        delete expense._id;
        res.status(200).json({ success: !!expense, expense });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
getExpenses = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, pagination, limit, fromDate, toDate } = req.query;
        const min = fromDate ? Date.parse(fromDate) : 0;
        let max = toDate ? Date.parse(toDate) : new Date().getTime();
        max = new Date(max).setHours(23, 59, 59, 999);
        const query = { orgId, "createdAt": { "$gte": min, "$lte": max } };
        const db = client.db("apolloHMS");
        const expenses = await mongo.fetchMany(
            db,
            "expenses",
            query,
            {},
            {},
            Number(limit) || 10,
            Number(pagination) || 0);
        const total = await mongo.documentCount(db, "expenses", query);
        res.status(200).json({ success: !!expenses, expenses, total });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
updateExpense = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const expense = await mongo.updateOne(db, "expenses", { orgId, uid }, req.body);
        res.status(200).json({ success: !!expense, expense });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
deleteExpense = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const expense = await mongo.deleteData(db, "expenses", { orgId, uid }, req.body);
        res.status(200).json({ success: !!expense, expense });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}

router.post("/expenses", setExpense)
router.get("/expenses/org/all", getExpenses)
router.get("/expenses/org/:orgId/:uid", getExpense)
router.put("/expenses/org/:orgId/:uid", updateExpense);
router.delete("/expenses/org/:orgId/:uid", deleteExpense);

module.exports = router;