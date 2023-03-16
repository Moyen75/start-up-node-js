const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);
const {patient, doctor,referredBy} = require(`${root}/services/populateQuery`)
const { populateId } = require(`${root}/services/utilities`);
const { insertOne } = require(`${root}/services/mongo-transactions`);

admissionInvoices = async (req, res, next) => {
  const client = await mongoConnect();
  try {
    const uid = populateId();
    const db = client.db("apolloHMS");
    const payload = req.body;
    payload.invoiceType = 'admission';
    payload.uid = uid;
    const { orgId, paidAmount, patient } = payload;

    const account = {
      uid: populateId(),
      invoiceId: uid,
      userId: patient,
      orgId,
      type: "income",
      description: "Admission invoice",
      name: "Admission invoice",
      amount: Number(paidAmount),
      createdAt: Date.now(),
      category: "indoor"
    }
    const [invoice] = await mongo.transaction([{operation:insertOne,operationParameter:[db, "invoices", payload]},{operation:insertOne,operationParameter:[db,"accounts",account]}],client);
    res.status(200).json({ success: !!invoice, invoice });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  } 
};

getOrgAdmissionInvoice = async (req, res, next) => {
  const client = await mongoConnect();
  const { orgId, uid } = req.params;

  try {
    const patientLookUp = patient();
    const doctorLookUp = doctor();
    const referredByLookUp = referredBy()

    const query = [
        {
            '$match': {
                orgId,
                uid
            }
        }, 
         ...patientLookUp,
          ...doctorLookUp,
          ...referredByLookUp,
       
    ]
    const db = client.db("apolloHMS");
    const invoice = await mongo.fetchWithAggregation (
      
      db,
      "invoices",
      query,
      {},
      { createdAt: -1 },
    );
    res.status(200).json({ success: !!invoice, invoice:invoice[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

getOrgAdmissionInvoices = async (req, res, next) => {
  const client = await mongoConnect();
  const { orgId, pagination, limit } = req.query;

  try {
    const patientLookUp = patient();
    const doctorLookUp = doctor();
     const referredByLookUp = referredBy()
    const query = [
        {
            '$match': {
            orgId,
            invoiceType: 'admission'
            }
        }, 
         ...patientLookUp,
         ...doctorLookUp,
         ...referredByLookUp,
    ]
    const db = client.db("apolloHMS");
    const invoice = await mongo.fetchWithAggregation (
      db,
      "invoices",
      query,
      {},
      { createdAt: -1 },
      Number(limit) || 10,
      Number(pagination) || 0
    );
    const total = await mongo.documentCount(db, "invoices", { orgId });
    res.status(200).json({ success: !!invoice, invoice, total });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

admissionInvoicesUpdate = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const payload = req.body;
    const invoice = await mongo.updateOne(
      db,
      "invoices",
      { uid, orgId },
      payload
    );
    res.status(200).json({ success: !!invoice, invoice });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

admissionInvoicesDelete = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const invoice = await mongo.deleteData(db, "invoices", {
      uid,
      orgId,
    });
    res.status(200).json({ success: !!invoice, invoice });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};



router.post("/admissions/invoices", admissionInvoices);
router.get("/admissions/invoices/org/:orgId/:uid", getOrgAdmissionInvoice);
router.get("/admissions/invoices/org", getOrgAdmissionInvoices);
router.put("/admissions/invoices/org/:orgId/:uid", admissionInvoicesUpdate);
router.delete("/admissions/invoices/org/:orgId/:uid", admissionInvoicesDelete);
module.exports = router;