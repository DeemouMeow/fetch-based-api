// import { Buffer } from "buffer";

export default class RequestConfig {
    baseURL = "";
    url = "";
    data = {};
    params = {};
    headers = {};
    timeout = 0; // default
    method = "GET"; // default
    credentials = "omit"; // default
    responseType = "json"; // default


    constructor(config = {}) {
        if (isEmptyObj(config)) return this;
        return this.constructConfig(config);
    }

    constructConfig (config) {
        if (typeof this.data == "string") this.data = {...JSON.parse(this.data)};

        for (const prop in config) {
            const option = config[prop];

            if (prop === "data") {
                const data = typeof option == "string" ? JSON.parse(option) : option;
                this.data = {...this.data, ...data};
            }

            else if (prop in this) this[prop] = option;
            
            else this.data[prop] = option;
        }

        
        this.data = JSON.stringify(this.data);
        this.headers = {...this.headers};

        const contentLength = (this.data).length;

        if (contentLength !== 2) this.headers["Content-Length"] = contentLength;
        this.url = config?.url?.includes(config?.baseURL) ? config?.url : config?.baseURL + config?.url;

        if (!isEmptyObj(this.params)) {
            this.url += "?";
            const entries = Object.entries(this.params);
            for (let i = 0; i < entries.length; i++) {
                const key = entries[i][0];
                const value = entries[i][1];
                this.url += key + "=" + value;
                if (i != entries.length - 1) this.url += "&";
            }
        }
        
        return this;
    }
}

function isEmptyObj(object) {
    for (const prop in object) {
        if (Object.hasOwn(object, prop)) return false;
    }

    return true;
}
