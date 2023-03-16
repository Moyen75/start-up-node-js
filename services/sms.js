const axios = require("axios");
module.exports = {
    async sendSMS(message, number) {
        const url = `https://api.smsinbd.com/sms-api/sendsms?api_token=${process.env.SMS_API_KEY}&senderid=${process.env.SMS_SENDER_ID}&message=${message}&contact_number=${number}`;
        const { data } = await axios.post(url);
        return data;
    }
}