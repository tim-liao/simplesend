import { StatusCodes } from "http-status-codes";
import customError from "./customError.js";
class notFoundError extends customError {
  constructor(message) {
    super(message);
    this.status = StatusCodes.NOT_FOUND;
  }
}
export default notFoundError;
