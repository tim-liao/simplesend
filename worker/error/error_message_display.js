export async function errorMessageDisplay(sendEmailId, err) {
  const now = Date.now();
  const dateString = new Date(now).toLocaleString();
  console.error(`${dateString} , SendEmailId : ${sendEmailId} , Error : `, err);
  return;
}
