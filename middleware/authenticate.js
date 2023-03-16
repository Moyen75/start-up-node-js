var admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
  }),
});

const authRoute = async (req, res, next) => {
  if (req.headers?.authorization) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      // verify user token
      const decodedUser = await admin.auth().verifyIdToken(token);
      const email = decodedUser.email
      if (!email) {
        throw new Error("No email found in decoded user");
      } if (!userId) {
        throw new Error("No userId found in decoded user");
      }
      req.headers.user = {
        email
      }
      next();
    } catch (err) {
      return res.status(403).send({ error: "Not Authorized", message: err.message });
    }
  } else {
    return res.status(401).send({ error: "Not Authorized", message: "No auth header found" });
  }
};
module.exports = authRoute;
