const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);


// const authRoute = require(`${root}/middleware/authenticate`);
// const authorize = require(`${root}/middleware/authorize`);

setTheatre = async (req, res, next) => {
  const client = await mongoConnect();
  try {

    const db = client.db("apolloHMS");
    const payload = req.body;
    const theatre = await mongo.insertOne(db, "theatre-settings", payload);
    res.status(200).json({ success: !!theatre, theatre });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await client.close();
  }
};

getTheatre = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;

  try {
    const db = client.db("apolloHMS");
    const theatre = await mongo.fetchOne(db, "theatre-settings", { orgId, uid, });
    res.status(200).json({ success: !!theatre, theatre });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await client.close();
  }
};
updateTheatre = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const payload = req.body;

    const theatre = await mongo.updateOne(
      db,
      "theatre-settings",
      { orgId, uid, },
      payload
    );
    res.status(200).json({ success: !!theatre, theatre });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await client.close();
  }
};

deleteTheatre = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const theatre = await mongo.deleteData(db, "theatre-settings", {
      uid,
      orgId,
    });
    res.status(200).json({ success: !!theatre, theatre });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

router.post("/operations/theatres", setTheatre);
router.get("/operations/theatres/org/:orgId/:uid", getTheatre);
router.put("/operations/theatres/org/:orgId/:uid", updateTheatre);
router.delete("/operations/theatres/org/:orgId/:uid", deleteTheatre);

module.exports = router;
