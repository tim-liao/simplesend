import { StatusCodes } from "http-status-codes";
import CustomError from "./customError.js";
class UnauthorizedError extends CustomError {
  constructor(message) {
    super(message);
    this.status = StatusCodes.UNAUTHORIZED;
  }
}
export default UnauthorizedError;
