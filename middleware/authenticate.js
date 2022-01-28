const jwt = require("jsonwebtoken");
const root = require("app-root-path");
// const config = require(`${root}/config`);
var admin = require("firebase-admin");

// var serviceAccount = require(`${root}/firebase-sdk-admin.json`);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const authRoute = async (req, res, next) => {
  if (req.headers?.authorization) {
    const token = req.headers.authorization.split(" ")[1];


    // verify user token
    const decodedUser = await admin.auth().verifyIdToken(token)
    console.log(decodedUser)
    // const firebase_user = await admin.auth().getUser(decoded.uid);
    // if (decoded.email != firebase_user.email || firebase_user.disabled) {
    //   return res.status(403).json({ error: "Not authorized " });
    // }
    try {
      // req.fb_user_id = decodedUser.uid;
      // req.auth_user_id = req.session.current_user_id;
      // req.auth_org_id = req.session.current_org_id;
      // req.auth_role = req.session.current_user_role;
      // req.auth_session_id = req.session.current_session_id;
      next();
    } catch (err) {
      console.log(err);
      return res.status(403).send("Unauthorized");
    }
  } else {
    return res.status(403).send("Unauthorized");
  }
}


module.exports = authRoute;
