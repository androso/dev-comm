export type ErrorDetail = {
    field: string;
    message: string;
};

export class BadRequestError extends Error {
    details?: ErrorDetail[];

    constructor(message: string, details?: ErrorDetail[]) {
        super(message)
        this.name = "BadRequestError"
        this.details = details
    }
}