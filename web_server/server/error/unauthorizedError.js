import { StatusCodes } from "http-status-codes";
import customError from "./customError.js";
class unauthorizedError extends customError {
  constructor(message) {
    super(message);
    this.status = StatusCodes.UNAUTHORIZED;
  }
}
export default unauthorizedError;
