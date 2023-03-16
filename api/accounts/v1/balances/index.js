const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);

getBalances = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId,fromDate,toDate,type} = req.query;
        const db = client.db("apolloHMS");
        const min = fromDate ? Date.parse(fromDate) : new Date().getTime();
        let max = toDate ? Date.parse(toDate) : new Date().getTime();
        max = new Date(max).setHours(23, 59, 59, 999);
        const match = { type, orgId, createdAt: { "$gte": min, "$lte": max } };

        const balances = await mongo.fetchWithoutpagination(db, "accounts", match);
        let totalAmount=0
        if (balances.length > 0) totalAmount = balances.reduce((acc, crr) => acc + crr.amount,0)
        const total = await mongo.documentCount(db, "accounts", match);
        res.status(200).json({ success: !!balances, balances, total ,totalAmount});
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};

router.get("/balances/org/all", getBalances)

module.exports = router;