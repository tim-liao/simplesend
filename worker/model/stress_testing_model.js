export async function fakeSNSResponse() {
  return {
    $metadata: {
      httpStatusCode: 200,
      requestId: "bdf1b7c6-cb51-462f-ac9f-3865438e1729",
      extendedRequestId: undefined,
      cfId: undefined,
      attempts: 1,
      totalRetryDelay: 0,
    },
    MessageId: "01060187cb8ce3e5-ded843c3-a054-4c1f-90e3-cea1bed2dc1b-000000",
  };
}

export async function fakeSESResponseERROR() {
  return {
    $fault: "client",
    $metadata: {
      httpStatusCode: 400,
      requestId: "97fff429-e203-409b-b097-9e18fd050824",
      extendedRequestId: undefined,
      cfId: undefined,
      attempts: 1,
      totalRetryDelay: 0,
    },
    Type: "Sender",
    Code: "InvalidParameterValue",
  };
}
