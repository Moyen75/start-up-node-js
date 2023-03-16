const router = require("express").Router();
const root = require("app-root-path");
const { updateOne } = require(`${root}/services/mongo-transactions`);
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);
const { staffs } = require(`${root}/services/populateQuery`);

// const authRoute = require(`${root}/middleware/authenticate`);
// const authorize = require(`${root}/middleware/authorize`);

getPersonData = async (req, res) => {
  const client = await mongoConnect();
  try {
    const staffsLookUp = staffs();
    const query = [
      {
        $match: {
          ...req.query,
        },
      },
      {
        $lookup: {
          from: "staffs",
          localField: "uid",
          foreignField: "uid",
          as: "staff",
        },
      },
    ];
    const db = client.db("apolloHMS");

    const person = await mongo.fetchWithAggregation(
      db,
      "person",
      query,
      {},
      {
        createdAt: -1,
      }
    );
    res.status(200).json({ success: !!person, person: person[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    await client.close();
  }
};

setPersonData = async (req, res, next) => {
  const client = await mongoConnect();
  try {
    const db = client.db("apolloHMS");
    const person = await mongo.insertOne(db, "person", req.body);
    res.status(200).json({
      success: !!person,
      person,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    await client.close();
  }
};
updatePersonData = async (req, res, next) => {
  const client = await mongoConnect();
  try {
    const db = client.db("apolloHMS");
    const payload = req.body;
    const person = await mongo.updateOne(
      db,
      "person",
      {
        uid: req.params.uid,
      },
      payload
    );
    res.status(200).json({
      success: !!person,
      person,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    await client.close();
  }
};
updateMemberData = async (req, res, next) => {
  const client = await mongoConnect();
  try {
    const { uid } = req.params;
    const db = client.db("apolloHMS");
    const { member, staff } = req.body;
    const operations = [
      {
        operation: updateOne,
        operationParameter: [
          db,
          "person",
          {
            uid,
          },
          member,
        ],
      },
      {
        operation: updateOne,
        operationParameter: [
          db,
          "staffs",
          {
            uid,
          },
          staff,
        ],
      },
    ];
    const person = await mongo.transaction(operations, client);
    res.status(200).json({
      success: !!person,
      person,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    await client.close();
  }
};
router.get("/person", getPersonData);
router.put("/person/:uid", updatePersonData);
router.put("/person/org/member/:orgId/:uid", updateMemberData);

router.post("/person", setPersonData);

module.exports = router;
