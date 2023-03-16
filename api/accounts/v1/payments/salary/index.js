const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);
const { populateId } = require(`${root}/services/utilities`);
const { insertMany ,updateOne} = require(`${root}/services/mongo-transactions`);

setSalary = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const db = client.db("apolloHMS");
        const salary = await mongo.insertOne(db, "salaries", req.body)
        res.status(200).json({ success: !!salary, salary });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
};
getSalary = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const salary = await mongo.fetchOne(db, "salaries", { orgId, uid });
        res.status(200).json({ success: !!salary, salary });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
getSalaries = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, month, year, pagination, limit } = req.query;
        const db = client.db("apolloHMS");
        let query = { orgId };
        if (month && year) query = { orgId, month, year: Number(year) }
        const salaries = await mongo.fetchMany(
            db,
            "salaries",
            query,
            {},
            {},
            Number(limit) || 10,
            Number(pagination) || 0);
        const total = await mongo.documentCount(db, "salaries", query)
        res.status(200).json({ success: !!salaries, salaries, total });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
updateSalary = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const payload = req.body;
        const { status } = payload;
        let salary = null;
        if (status === "approved") {
            const { selectStaffs, month, year } = await mongo.fetchOne(db, "salaries", { orgId, uid });
            const populateExpense = selectStaffs.map(staff => {
                const expenseId = populateId();
                return {
                    uid: expenseId,
                    invoiceId: uid,
                    type: "expense",
                    orgId,
                    name: "salary",
                    userId: staff.uid,
                    amount: staff.total,
                    description: month + "-"+year
                }
            });
            [salary] = await mongo.transaction([{ operation: updateOne, operationParameter: [db, "salaries", { orgId, uid }, payload] },{ operation: insertMany, operationParameter: [db, "accounts", populateExpense] }],client);
        } else {
            salary= await mongo.updateOne(db, "salaries", { orgId, uid },payload);
        };
        res.status(200).json({ success: !!salary, salary });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}
deleteSalary = async (req, res, next) => {
    const client = await mongoConnect();
    try {
        const { orgId, uid } = req.params;
        const db = client.db("apolloHMS");
        const salary = await mongo.deleteData(db, "salaries", { orgId, uid });
        res.status(200).json({ success: !!salary, salary });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
}

router.post("/salaries", setSalary)
router.get("/salaries/org/all", getSalaries)
router.get("/salaries/org/:orgId/:uid", getSalary)
router.put("/salaries/org/:orgId/:uid", updateSalary);
router.delete("/salaries/org/:orgId/:uid", deleteSalary);

module.exports = router;