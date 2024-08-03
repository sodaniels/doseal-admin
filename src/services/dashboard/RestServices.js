const axios = require('axios');
const config = require('../../config/services');
const { Log } = require('../../helpers/Log');
require("dotenv").config();

class RestServices {
    constructor() {
        this.baseUrl = config.base_url;
        this.token = null;
    }

    async getToken() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            clientId: config.clientId,
            clientSecret: config.clientSecret,
        };
        const url = `${config.base_url}/oauth/token`;
        const data = {};

        try {
            Log.info('[RestServices][getToken] \t requesting for token')
            const response = await axios({
                method: 'POST',
                url,
                headers,
                data,
            });
            this.token = response.data.token;
        } catch (error) {
            Log.info(`token erro: ${error}`);
            return null;
        }
    }


    async postBusiness(businessName, physicalLocation, email, phoneNumber, client_reference) {
        const resource = '/business';
        const body = {
            businessName,
            physicalLocation,
            email,
            phoneNumber
        };
        return this.makeRequest({
            resource,
            method: 'POST',
            body,
            client_reference,
        });
    }

    async makeRequest(options) {
        Log.info(`[RestServices][makeRequest]\t token: *********************`);
        const { resource, method, body, client_reference } = options;
        const url = `${this.baseUrl}/api/v1/${resource}`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
        };
        const data = {
            ...body,
            client_reference,
        };

        try {
            const response = await axios({
                method,
                url,
                headers,
                data,
            });

            return response.data;
        } catch (error) {
            console.error('Error:', error.response.data);
            throw new Error('Request failed');
        }
    }



}

module.exports = RestServices;
