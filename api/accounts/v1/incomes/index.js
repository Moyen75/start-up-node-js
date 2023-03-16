const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);


setIncome = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const db = client.db("apolloHMS");
        const income = await mongo.insertOne(db, "incomes", req.body)
        res.status(200).json({ success: !!income, income });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};
getIncome = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const income = await mongo.fetchOne(db, "incomes", { orgId, uid });
        res.status(200).json({ success: !!income, income });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
getIncomes = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, pagination, limit } = req.query;
        const db = client.db("apolloHMS");
        const incomes = await mongo.fetchMany(
            db,
            "incomes",
            { orgId },
            {},
            {},
            Number(limit) || 10,
            Number(pagination) || 0);
        const total = await mongo.documentCount(db, "incomes", { orgId })
        res.status(200).json({ success: !!incomes, incomes, total });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
updateIncome = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const income = await mongo.updateOne(db, "incomes", { orgId, uid }, req.body);
        res.status(200).json({ success: !!income, income });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
deleteIncome = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const income = await mongo.deleteData(db, "incomes", { orgId, uid }, req.body);
        res.status(200).json({ success: !!income, income });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}

router.post("/incomes", setIncome)
router.get("/incomes/org/all", getIncomes)
router.get("/incomes/org/:orgId/:uid", getIncome)
router.put("/incomes/org/:orgId/:uid", updateIncome);
router.delete("/incomes/org/:orgId/:uid", deleteIncome);

module.exports = router;