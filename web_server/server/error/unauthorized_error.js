import { StatusCodes } from "http-status-codes";
import CustomError from "./custom_error.js";
class UnauthorizedError extends CustomError {
  constructor(message) {
    super(message);
    this.status = StatusCodes.UNAUTHORIZED;
  }
}
export default UnauthorizedError;
