import { StatusCodes } from "http-status-codes";
import CustomError from "./custom_error.js";
class NotFoundError extends CustomError {
  constructor(message) {
    super(message);
    this.status = StatusCodes.NOT_FOUND;
  }
}
export default NotFoundError;
