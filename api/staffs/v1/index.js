const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);

setStaff = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const db = client.db("apolloHMS");
        const staff = await mongo.insertOne(db, "staffs", req.body)
        res.status(200).json({ success: !!staff, staff });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};
getStaff = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { uid, orgId } = req.params;
        const db = client.db("apolloHMS");
        const query = [
            {
                '$match': {
                    uid
                }
            }
        ]
        const staff = await mongo.fetchWithAggregation(db, "staffs", query, {}, { createdAt: -1 });
        res.status(200).json({ success: !!staff, staff: staff[0] });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};
updateStaff = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { uid, orgId } = req.params
        const db = client.db("apolloHMS");
        const staff = await mongo.updateOne(db, "staffs", { uid, orgId }, req.body)
        res.status(200).json({ success: !!staff, staff });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};
getStaffs = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, pagination, limit } = req.query;
        const db = client.db("apolloHMS");
        const staffs = await mongo.fetchMany(
            db,
            "staffs",
            { orgId },
            {},
            {},
            Number(limit),
            Number(pagination)
        );
        const total = await mongo.documentCount(db, "staffs", { orgId })
        res.status(200).json({ success: !!staffs, staffs, total });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};
deleteStaff = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { uid, orgId } = req.params;
        const db = client.db("apolloHMS");
        const staff = await mongo.deleteData(db, "staffs", { uid, orgId })
        res.status(200).json({ success: !!staff, staff });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};

router.post("/staffs", setStaff)
router.get("/staffs/org/:orgId/:uid", getStaff)
router.get("/staffs/org", getStaffs)
router.put("/staffs/org/:orgId/:uid", updateStaff)
router.delete("/staffs/org/:orgId/:uid", deleteStaff)

module.exports = router;