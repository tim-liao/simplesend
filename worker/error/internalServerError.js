import { StatusCodes } from "http-status-codes";
import ServerError from "./serverError.js";

class InternalServerError extends ServerError {
  constructor(message) {
    super(message);
    this.status = StatusCodes.INTERNAL_SERVER_ERROR;
  }
}

export default InternalServerError;
