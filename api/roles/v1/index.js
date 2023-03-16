const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);


setRole = async (req, res, next) => {
    const client = await mongoConnect();
    try {

        const db = client.db("apolloHMS");
        role = await mongo.insertOne(db, "roles", req.body);
        if (role) {
            const { uid } = role;
            await mongo.updateOneArray(db, "organizations", { orgId }, { "roles": uid });
        }
        res.status(200).json({ success: !!role, role });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

getOrgRole = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const role = await mongo.fetchOne(db, "roles", { uid, orgId });
        delete role._id;
        res.status(200).json({ success: !!role, role });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

updateRole = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const payload = req.body;
        const role = await mongo.updateOne(
            db,
            "roles",
            { uid, orgId },
            payload
        );
        res.status(200).json({ success: !!role, role });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

deleteRole = async (req, res, next) => {
    const client = await mongoConnect();
    const { uid, orgId } = req.params;
    try {
        const db = client.db("apolloHMS");
        const role = await mongo.deleteData(db, "roles", { uid, orgId });
        res.status(200).json({ success: !!role, role });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await client.close();
    }
};

router.post("/roles", setRole);
router.get("/roles/org/:orgId/:uid", getOrgRole);
router.put("/roles/org/:orgId/:uid", updateRole);
router.delete("/roles/org/:orgId/:uid", deleteRole);

module.exports = router;
