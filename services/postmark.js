const axios = require("axios")

module.exports = {
    async sendInvitaion(name, organizationName, actionUrl, email, supportEmail, alias) {
        const body = {
            "TemplateAlias": alias,
            "TemplateModel": { name, organizationName, actionUrl, supportEmail },
            "InlineCss": true,
            "From": "apollohms@nurii.co",
            "Bcc": email,
        }
        const { data } = await axios.post("https://api.postmarkapp.com/email/withTemplate", body, { headers: { 'Accept': 'application/json, text/plain, */*', "content-type": "application/json", "X-Postmark-Server-Token": process.env.POSTMARK_SERVER_TOKEN } });
        return data.Message === "OK" ? true : false;
    }
}