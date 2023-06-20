export default class APIError extends Error {
  status: string;
  isOperational: boolean;

  constructor(public message: string, public statusCode: number) {
    super(message);
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
  }
}

export class CustomError extends APIError {
  code?: number;
  path?: string;
  value?: string;
  errors?: Error[];
}
