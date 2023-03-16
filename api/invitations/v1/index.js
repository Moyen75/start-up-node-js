const router = require("express").Router();
const root = require("app-root-path");
const { insertOne, updateOneArray, updateOne } = require(`${root}/services/mongo-transactions`);
const mongoConnect = require(`${root}/services/mongo-connect`);
const { sendInvitaion } = require(`${root}/services/postmark`);
const { populateId } = require(`${root}/services/utilities`);
const mongo = require(`${root}/services/mongo-crud`);

postInvitationDetails = async (req, res, next) => {
  const client = await mongoConnect();
  try {
    const db = client.db("apolloHMS");
    const payload = req.body;
    payload.status = "pending";
    payload.validTill = Date.now() + Number(process.env.INVITATION_VALIDITY)
    const supportEmail = "hello@connekt.studio";

    const { name, organizationName, userType, email, orgUsername, orgId, staff } = payload;
    if ((userType !== "org_admin") && (userType !== "org_member")) throw new Error("Invalid user type!")

    const orgName = organizationName.replace(/ /g, "-")
    let alias = "admin-invitation";

    let userId = populateId();
    const invitationId = populateId();
    payload.uid = invitationId;

    const status = "pending";
    const person = {
      name,
      email,
      uid: userId,
      orgId,
      status,
      userType
    };

    let tempOrgName = "Apollo Hospital Management System"
    const member = await mongo.fetchOne(db, "person", { email });
    if (member && member.userType === userType) {
      await client.close();
      return res.status(200).json({ success: false, message: "Member Already Exists!" })
    }
    else if (member && member.userType !== userType && member.userType !== "org_admin") {
      userId = member.uid
      tempOrgName = organizationName;
      const url = `${process.env.BASE_URL}/signup?onboarding=false&type=${userType}&organization=${orgName}&invitationId=${uid}&email=${email}&userId=${userId}&orgId=${orgId}`;
      await sendInvitaion(name, tempOrgName, url, email, supportEmail, alias);
      return res.status(200).json({ success: true, invitation: true });
    }

    let operations;
    if (userType === "org_admin") {
      operations = [{ operation: insertOne, operationParameter: [db, "invitations", payload] }, { operation: updateOneArray, operationParameter: [db, "organizations", { username: orgUsername.toLowerCase() }, { members: userId }] }, { operation: insertOne, operationParameter: [db, "person", person] }];
    }
    else if (userType === "org_member") {
      tempOrgName = organizationName;
      alias = "member-invitation";
      operations = [{ operation: insertOne, operationParameter: [db, "invitations", payload] }, { operation: updateOneArray, operationParameter: [db, "organizations", { username: orgUsername.toLowerCase() }, { members: userId }] }, { operation: insertOne, operationParameter: [db, "person", person] }];
    }
    else {
      await client.close();
      return res.status(200).json({ success: false, message: "Invalid User Type!" });
    }

    const staffOperation = { operation: insertOne, operationParameter: [db, "staffs", { ...staff, status, uid: userId }] }

    const actionUrl = `${process.env.BASE_URL}/signup?onboarding=false&type=${userType}&organization=${orgName}&invitationId=${invitationId}&email=${email}&userId=${userId}&orgId=${orgId}`;

    const sentInvitation = await sendInvitaion(name, tempOrgName, actionUrl, email, supportEmail, alias);
    if (!sentInvitation) throw new Error("something wrong to send invitation!");

    const invitation = await mongo.transaction([...operations, staffOperation], client);
    res.status(200).json({ success: !!invitation, invitation });
  } catch (err) {
    console.log(err)
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await client.close();
  }
};

getInvitation = async (req, res, next) => {
  const client = await mongoConnect();
  const { uid } = req.params;
  try {
    const db = client.db("apolloHMS");
    const invitation = await mongo.fetchOne(db, "invitations", { uid });
    res.status(200).json({ success: !!invitation, invitation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await client.close();
  }
};

updateInvitation = async (req, res, next) => {
  const client = await mongoConnect();
  const { invitationId, orgId } = req.params;
  try {
    const db = client.db("apolloHMS");
    const payload = req.body;
    const { status, uid } = payload;
    delete payload.uid;
    console.log(status)
    const invitation = await mongo.transaction([{ operation: updateOne, operationParameter: [db, "invitations", { uid: invitationId }, { status }] }, { operation: updateOne, operationParameter: [db, "person", { uid }, payload] }, { operation: updateOne, operationParameter: [db, "staffs", { uid }, { status }] }, { operation: updateOne, operationParameter: [db, "organizations", { orgId }, { status }] }], client);
    res.status(200).json({ success: !!invitation, invitation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await client.close();
  }
};

router.post("/invitations", postInvitationDetails);
router.get("/invitations/:uid", getInvitation);
router.put("/invitations/:orgId/:invitationId", updateInvitation);

module.exports = router;
