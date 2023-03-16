const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);


dapartmentCreate = async (req, res, next) => {
  const client = await mongoConnect();
  try {

    const db = client.db("apolloHMS");
    const payload = req.body;
    const department = await mongo.insertOne(db, "department-settings", req.body);
    res.status(200).json({ success: !!department, department });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};



getOrgDepartment = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const department = await mongo.fetchOne(db, "department-settings", { uid, orgId });
    res.status(200).json({ success: !!department, department });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

departmentUpdate = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const payload = req.body;

    const department = await mongo.updateOne(
      db,
      "department-settings",
      { uid, orgId },
      payload
    );
    res.status(200).json({ success: !!department, department });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

departmentDelete = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const department = await mongo.deleteData(db, "department-settings", {
      uid,
      orgId,
    });
    res.status(200).json({ success: !!department, department });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

router.post("/departments", dapartmentCreate);
router.get("/departments/org/:orgId/:uid", getOrgDepartment);
router.put("/departments/org/:orgId/:uid", departmentUpdate);
router.delete("/departments/org/:orgId/:uid", departmentDelete);

module.exports = router;
