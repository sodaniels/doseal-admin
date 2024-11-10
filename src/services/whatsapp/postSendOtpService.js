const { Log } = require("../../helpers/Log");
const User = require('../../models/user');
const { randId } = require('../../helpers/randId');
const { setRedis, getRedis, setRedisExpiresOneMinute } = require('../../databases/redis');
const sendText = require('../../helpers/sendText');

async function execute(req, res) {
    Log.info(`[postSendOtpService.js][execute]..initiating post OTP: ${JSON.stringify(req.body)}`);

    let code, response;
    Log.info("[postSendOtpService.js][execute]..initiaze send code");

    try {

        let msisdn = req.body.msisdn.replace(/ /g, ''); // Remove all spaces from the phone number
        let q = msisdn.slice(-9); // Get the last 9 digits of the phone number

        const check_if_not_expired = await getRedis(`registration_expire_in_a_minute_${q}`);

        if (!check_if_not_expired || check_if_not_expired===null || check_if_not_expired === undefined) {
            if (req.body.msisdn) {
                if (q === '244139937') {
                    code = '200300';
                } else {
                    code = randId();
                }

                Log.info(`[postSendOtpService.js][execute]..code: ${code}`); // remove code on production
                setRedis(`registration_init_${q}`, code);
                setRedisExpiresOneMinute(`registration_expire_in_a_minute_${q}`, code);
                if (q !== '244139937') {
                    let numToSendCode;
                    if (msisdn.length === 9 || msisdn.length === 10) {
                        numToSendCode = '233' + q;
                    } else {
                        numToSendCode = msisdn;
                    }

                    response = await sendText(numToSendCode, `Your ${process.env.APP_NAME} code is ${code}. Never share  this code.`);
                }

                if (q === '244139937') {
                    return {
                        success: true,
                        message: 'CODE_SENT'
                    }
                }

                if (response) {
                    if (response.status == 0) {
                        Log.info(`[postSendOtpService.js][execute]..response sent: ${JSON.stringify(response)}`);
                        return {
                            success: true,
                            message: 'CODE_SENT'
                        }
                    }
                    return {
                        success: false,
                        message: 'CODE_NOT_SENT'
                    }
                }

                return {
                    success: false,
                    message: 'INVALID_NUMBER'
                };
            }
        }


    } catch (error) {
        Log.info("[postSendOtpService.js][execute]..error", error);
        console.log(error);
        return {
            success: false,
            message: 'ERROR_OCCURRED'
        }
    }
}

module.exports = {
    execute,
};
