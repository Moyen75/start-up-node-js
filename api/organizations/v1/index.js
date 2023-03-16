const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);
const { populateRoles } = require(`${root}/services/populateRoles`);
const { populateId } = require(`${root}/services/utilities`);
const { populateLookupForOrg } = require(`${root}/services/populateQuery`)

const arr = ["person", "roles", "doctors", "bed-settings", "department-settings", "designation-settings", "expense-settings", "incomeHead-settings", "product-settings", "category-settings", "operation-settings", "reference-settings", "specialist-settings", "supplier-settings", "theatre-settings", "accessories-settings", "anesthesia-settings", "degree-settings"]
postOrganizationDetails = async (req, res, next) => {
  const client = await mongoConnect();
  try {
    const payload = req.body;
    const { username } = payload;
    const orgId = populateId();
    const db = client.db("apolloHMS");
    if (!username) return res.status(200).json({ success: false, message: "org username must be given!" });
    const isOrgUsernameExists = await mongo.documentExists(
      db,
      "organizations",
      { username }
    );
    if (isOrgUsernameExists) return res.status(200).json({ success: false, message: "Organization username already exists" })
    const roles = await populateRoles(orgId);
    payload.orgId = orgId;
    const organization = await mongo.insertOrg(db, "organizations", payload);
    if (organization) {
      await mongo.insertMany(db, "roles", roles)
    }
    res.status(200).json({ success: !!organization, organization });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await client.close();
  }
};
getOrganization = async (req, res, next) => {
  const client = await mongoConnect();
  const { orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const lookups = await populateLookupForOrg(arr)
    const query = [
      {
        '$match': {
          orgId
        }
      },
      ...lookups
    ]
    const organization = await mongo.fetchWithAggregation(db, "organizations", query, { '_id': 0, 'members._id': 0, "doctors._id": 0, "doctors.hospitals": 0, "roles._id": 0, "beds._id": 0, "departments._id": 0, "designations._id": 0, "expenses._id": 0, "incomeHeads._id": 0, "products._id": 0, "categories._id": 0, "operations._id": 0, "references._id": 0, "specialists._id": 0, "suppliers._id": 0, "theatres._id": 0, "accessoriess._id": 0, "degrees._id": 0, "person._id": 0, "anesthesias._id": 0, }, { createdAt: -1 });
    const doctors = organization[0].doctors;
    delete organization[0].doctors;
    organization[0].members = organization[0].person
    delete organization[0].person
    const { beds, departments, designations, expenses, incomeHeads, products, categories, degrees, operations, references, specialists, suppliers, theatres, accessoriess, anesthesias } = organization[0]
    const settings = { beds, departments, designations, expenses, incomeHeads, products, degrees, categories, operations, references, specialists, suppliers, theatres, accessoriess, anesthesias }
    delete organization[0].beds;
    delete organization[0].departments;
    delete organization[0].designations;
    delete organization[0].expenses;
    delete organization[0].incomeHeads;
    delete organization[0].products;
    delete organization[0].categories;
    delete organization[0].operations;
    delete organization[0].references;
    delete organization[0].specialists;
    delete organization[0].suppliers;
    delete organization[0].theatres;
    delete organization[0].accessoriess;
    delete organization[0].anesthesias
    delete organization[0].degrees
    res.status(200).json({ success: !!organization, organization: organization[0], settings, doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await client.close();
  }
};
getOrganizations = async (req, res, next) => {
  const client = await mongoConnect();
  try {
    const { pagination, limit } = req.query;
    const db = client.db("apolloHMS");
    let organizations = await mongo.fetchMany(
      db,
      "organizations",
      {},
      {},
      { createdAt: -1 },
      Number(limit) || 10,
      Number(pagination) || 0
    );
    organizations = organizations.map(object => {
      delete object.roles
      return object;
    })
    const total = await mongo.documentCount(db, "organizations", {})
    res.status(200).json({ success: !!organizations, organizations, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await client.close();
  }
};
updateOrganization = async (req, res, next) => {
  const client = await mongoConnect();
  const { orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const payload = req.body;
    const organization = await mongo.updateOne(
      db,
      "organizations",
      { orgId },
      payload
    );
    res.status(200).json({ success: !!organization, organization });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await client.close();
  }
};

router.post("/organizations", postOrganizationDetails);
router.get("/organizations/:orgId", getOrganization);
router.get("/organizations/org/all", getOrganizations);
router.put("/organizations/:orgId", updateOrganization);
module.exports = router;
