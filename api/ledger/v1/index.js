const router = require("express").Router();
const root = require("app-root-path");
const mongo = require(`${root}/services/mongo-crud`);
const mongoConnect = require(`${root}/services/mongo-connect`);
const {invoices,reports,prescriptions} = require(`${root}/services/populateQuery`);

getOrgLedger = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const testInvoiceLookup = invoices("test-invoices", "test");
    const visitInvoiceLookup = invoices("visit-invoices", "visit");
    const emergencyInvoiceLookup = invoices("emergency-invoices", "emergency");
    const admissionInvoiceLookup = invoices("admission-invoices", "admission");
    const operationPaymentInvocieLookup = invoices("operation-payment-invoices", "payments");
    const reportsLookup = reports();
    const prescriptionLookup = prescriptions();
    const query = [
      {
        $match: {
          uid,
          orgId,
        },
      },
      ...testInvoiceLookup,
      ...visitInvoiceLookup,
      ...emergencyInvoiceLookup,
      ...admissionInvoiceLookup,
      ...operationPaymentInvocieLookup,
      ...reportsLookup,
      ...prescriptionLookup
    ];
    const ledger = await mongo.fetchWithAggregation(
      db,
      "patients",
      query,
      {},
      { createdAt: 1 }
    );
    res.status(200).json({ success: !!ledger, ledger: ledger[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

getOrgLedgers = async (req, res, next) => {
  const client = await mongoConnect();
  const { orgId, pagination, limit } = req.query;
  try {
    const db = client.db("apolloHMS");
    
    const testInvoiceLookup = invoices("test-invoices", "test");
    const visitInvoiceLookup = invoices("visit-invoices", "visit");
    const emergencyInvoiceLookup = invoices("emergency-invoices", "emergency");
    const admissionInvoiceLookup = invoices("admission-invoices", "admission");
    const operationPaymentInvocieLookup = invoices("operation-payment-invoices", "payments");
    const reportsLookup = reports();
    const prescriptionLookup = prescriptions();
    const query = [
      {
        $match: {
          orgId,
        },
      },
      ...testInvoiceLookup,
      ...visitInvoiceLookup,
      ...emergencyInvoiceLookup,
      ...admissionInvoiceLookup,
      ...operationPaymentInvocieLookup,
      ...reportsLookup,
      ...prescriptionLookup
    ];
    const ledgers = await mongo.fetchWithAggregation(
      db,
      "patients",
      query,
      {},
      { createdAt: 1 },
      Number(limit) || 10,
      Number(pagination) || 0
    );
    const total = await mongo.documentCount(db, "patients", { orgId });
    res.status(200).json({ success: !!ledgers, ledgers, total });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    await client.close();
  }
};

router.get("/ledger/org/:orgId/:uid", getOrgLedger);
router.get("/ledger/org", getOrgLedgers);

module.exports = router;
