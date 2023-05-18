import { StatusCodes } from "http-status-codes";
import customError from "./customError.js";

class badRequestError extends customError {
  constructor(message) {
    super(message);
    this.status = StatusCodes.BAD_REQUEST;
  }
}

export default badRequestError;
