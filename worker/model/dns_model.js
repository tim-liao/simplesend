import dns from "dns";
export async function getTxtDNSSetting(domainName) {
  const domain = domainName;
  const txtRecord = "txt." + domain;
  const dnsPromises = dns.promises;
  let output = await dnsPromises.resolveTxt(txtRecord);
  return output;
}
