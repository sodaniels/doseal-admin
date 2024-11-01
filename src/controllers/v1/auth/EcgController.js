const axios = require("axios");
const { Log } = require("../../../helpers/Log");

async function makeHubtelEcgRequest(req, res) {
	try {
        const response = await axios.post(endpoint, {
            Destination: req.body.mobile_account,
            Amount: req.body.total_to_pay,
            CallbackUrl: process.env.HUBTEL_CALLBACK_URL,
            ClientReference: req.body.uniqId,
            Extradata: {
                bundle: req.body.meter_id
            }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.HUBTEL_AUTH
            }
        });

        const httpResponse = response.data;
        console.info(`[Hubtel][requestToHubtelEcgTopupEndpoint][${transaction.id}][${transaction.mno}] httpResponse .... received`, httpResponse);

        return httpResponse;
    } catch (error) {
        const errorMessage = error.message;
        return errorMessage;
    }
}

module.exports = {
	makeHubtelEcgRequest,
};
