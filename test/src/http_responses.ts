
export class HTTPResponse extends Error {
    public code: number = 500;

    constructor(message?: string, cause?: Error) {
        if (!message) {
            message = '500 Internal Server Error';
        }
        super(message, cause);
        this.code = 500;
    }
}

export class HTTP404Response extends HTTPResponse {
    constructor(message?: string, cause?: Error) {
        if (!message) {
            message = '404 Not Found';
        }
        super(message, cause);
        this.code = 400;
    }
}

export class HTTP500Response extends HTTPResponse {
    constructor(message?: string, cause?: Error) {
        if (!message) {
            message = '500 Internal Server Error';
        }
        super(message, cause);
        this.code = 500;
    }
}

