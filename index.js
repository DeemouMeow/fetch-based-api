import ClientError from "./errors/client-errors.js";
import ResponseConfig from "./response-config.js";
import RequestConfig from "./request-config.js";
import { applyFulfieldHandlers, applyRejectHandlers } from "./interceptors.js";
import timeoutFetch from "./timeout-fetch.js";

class API {
    config = {};
    defaults = {};
    interceptors = {
        request: {
            _handlers: {
                onFulfield: [],
                onRejected: []
            },
            use(onFulfield, onRejected) {
                if (onFulfield) this._handlers.onFulfield.push(onFulfield);
                if (onRejected) this._handlers.onRejected.push(onRejected);
            }
        },
        response: {
            _handlers: {
                onFulfield: [],
                onRejected: []
            },
            use(onFulfield, onRejected) {
                if (onFulfield) this._handlers.onFulfield.push(onFulfield);
                if (onRejected) this._handlers.onRejected.push(onRejected);
            }
        }
    };

    constructor(config = {}) {
        this.config = new RequestConfig(config);
    }

    create(config = {}) {
        const APIconfig = new RequestConfig(config);
        return new API(APIconfig);
    }

    async get(url, config = {}) {
        const fetchingConfig = {...this.config, ...config, url, method: "GET"};
        const data = await this.request(fetchingConfig);

        return data;
    }

    async post(url, config = {}) {
        const fetchingConfig = {...this.config, ...config, url, method: "POST"};
        const data = await this.request(fetchingConfig);

        return data;
    }

    async put(url, config = {}) {
        const fetchingConfig = {...this.config, ...config, url, method: "PUT"};
        const data = await this.request(fetchingConfig);

        return data;
    }

    async delete(url, config = {}) {
        const fetchingConfig = {...this.config, ...config, url, method: "DELETE"};
        const data = await this.request(fetchingConfig);

        return data;
    }

    async request(config = {}) {
        config = (config instanceof RequestConfig) ? config : new RequestConfig(config);
        const requestOptions = await applyFulfieldHandlers(this.interceptors.request._handlers.onFulfield, config);
        
        const fetchOptions = {
            headers: requestOptions.headers,
            method: requestOptions.method,
            credentials: requestOptions.credentials,
        };

        if (fetchOptions.method !== "GET" && fetchOptions.method !== "HEAD") {
            fetchOptions.body = requestOptions.data;
        }

        try {
            const { timeout } = requestOptions;
            const response = timeout ? await timeoutFetch(requestOptions.url, fetchOptions, timeout) : await fetch(requestOptions.url, fetchOptions);

            const data = await response.json();

            if (response.status >= 400) {
                const responseError = ClientError.ResponseError(response.status, data.message, requestOptions);
                
                const retry = await applyRejectHandlers(this.interceptors.response._handlers.onRejected, responseError);

                if (retry instanceof Error) {
                    retry.message = "Request failed with status code " + response.status;
                    throw retry;
                } else {
                    return retry;
                }
            }

            const responseConfig = new ResponseConfig(response, requestOptions);
            responseConfig.data = data;
            const updatedResponseConfig = await applyFulfieldHandlers(this.interceptors.response._handlers.onFulfield, responseConfig);
            
            return updatedResponseConfig;
        } catch (error) {
            if (error.name === "AbortError") console.log("Request was aborted!");
            if (error.status < 500) throw error;
            const newError = ClientError.RequestError(400, "Request error with status code " + error.status, requestOptions);
            const requestError = await applyRejectHandlers(this.interceptors.request._handlers.onRejected, newError);
            throw requestError;
        }
    }
}

export default new API();