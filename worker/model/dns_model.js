import dns from "dns";
export async function getTxtDNSSetting(domainName) {
  const domain = domainName;
  const txtRecord = "txt." + domain;
  // const options = {
  //   timeout: 10000, // 設置查詢超時時間為 10 秒
  // };
  const dnsPromises = dns.promises;
  let output = await dnsPromises.resolveTxt(txtRecord);
  return output;
}
