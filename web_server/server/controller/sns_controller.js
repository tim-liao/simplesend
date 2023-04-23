export async function sns(req, res, next) {
  const data = req.body;
  console.log(data);
  res.status(200).send({ l: 1 });
}
