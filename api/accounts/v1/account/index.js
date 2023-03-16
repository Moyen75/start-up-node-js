const router = require("express").Router();
const root = require("app-root-path");
const prisma = require(`${root}/services/prisma-crud`);
const prismaClient = require(`${root}/services/prisma-client`);
const { populateId } = require(`${root}/services/utilities`);


setAccount = async (req, res, next) => {
    try {
        const uid = await populateId();
        const payload = req.body;
        payload.uid = uid;
        const account = await prisma.insertOne(prismaClient.accounts, payload);
        res.status(200).json({ success: !!account, account });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
};
getAccount = async (req, res, next) => {
    try {
        const { orgId, uid } = req.params;
        const account = await prisma.fetchOne(prismaClient.accounts, { uid });
        res.status(200).json({ success: !!account, account });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
}
getAccounts = async (req, res, next) => {
    try {
        const { orgId, pagination, limit } = req.query;
        const accounts = await prisma.fetchMany(
            prismaClient.accounts,
            { orgId },
            Number(limit) || 10,
            Number(pagination) || 0
        );
        res.status(200).json({ success: !!accounts, accounts });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
}
updateAccount = async (req, res, next) => {
    try {
        const { uid } = req.params;
        const account = await prisma.updateOne(prismaClient.accounts, { uid }, req.body);
        res.status(200).json({ success: !!account, account });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
}
deleteAccount = async (req, res, next) => {
    try {
        const { orgId, uid } = req.params;
        const account = await prisma.deleteOne(prismaClient.accounts, { uid });
        res.status(200).json({ success: !!account, account });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
}

router.post("/account", setAccount)
router.get("/account/org/all", getAccounts)
router.get("/account/org/:orgId/:uid", getAccount)
router.put("/account/org/:orgId/:uid", updateAccount);
router.delete("/account/org/:orgId/:uid", deleteAccount);

module.exports = router;