import { StatusCodes } from "http-status-codes";
import customError from "./customError.js";
class forbiddenError extends customError {
  constructor(message) {
    super(message);
    this.status = StatusCodes.FORBIDDEN;
  }
}
export default forbiddenError;
