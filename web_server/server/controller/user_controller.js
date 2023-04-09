import { selectUserProfile } from "../model/user_model.js";

export async function getUserProfile(req, res, next) {
  const { userId } = req.body;
  let userProfile;
  try {
    userProfile = await selectUserProfile(userId);
  } catch (e) {
    const err = new Error();
    err.stack = "cannot get userProfile from sql";
    err.status = 500;
    throw err;
  }

  res.status(200).send({ data: userProfile[0] });
}
