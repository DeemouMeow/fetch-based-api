const errorTypes = {
    response: "response",
    request: "request"
};

export default class ApiError extends Error {
    request = {
        status: 200,
        message: ""
    };
    response = {
        status: 200,
        message: ""
    };
    config;
    status;

    constructor(status, message, type, config = {}) {
        super(message);

        if (type === errorTypes.request) {
            this.request.status = status;
            this.request.message = message;
            this.response = null;
        }
        else if (type === errorTypes.response) {
            this.response.status = status;
            this.response.message = message;
            this.request = null;
        }

        this.config = config;
        this.status = status;
    }

    static ResponseError(status, message, config) {
        return new ApiError(status, message, "response", config);
    }

    static RequestError(status, message, config) {
        return new ApiError(status, message, "request", config);
    }
}