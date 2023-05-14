import { StatusCodes } from "http-status-codes";
import CustomError from "./customError.js";
class ForbiddenError extends CustomError {
  constructor(message) {
    super(message);
    this.status = StatusCodes.FORBIDDEN;
  }
}
export default ForbiddenError;
