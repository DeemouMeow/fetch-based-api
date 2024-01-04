export default class ResponseConfig {
    data = {};
    status = 200;
    headers = {};
    config = {}; // `config` is the config that was provided for the request

    constructor (response, requestConfig) {
        return this.constructConfig(response, requestConfig);
    }

    constructConfig(response, requestConfig) {
        this.status = response.status;
        this.headers = Object.fromEntries(response.headers);
        this.config = requestConfig;

        return this;
    }
}