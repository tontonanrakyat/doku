var clientId = "";
var secretKey = "";
var environmentUrl = "https://sandbox.doku.com";
var requestTarget = "/credit-card/v1/payment-page";

// ----- ----- ----- ----- ----- ----- ----- -----

var url;
var requestId;
var requestTimestamp;
var digest;
var rawSignature;
var signature;
var body;
var headers = new Headers();
var paymentUrl;

// ----- ----- ----- ----- ----- ----- ----- -----

async function getPaymentPage() {
  try {
    getInput();
    prepare();

    var requestOptions = {
      method: "POST",
      headers: headers,
      body: body,
    };

    var response = await fetch(url, requestOptions);
    if (!response.ok) {
      const errorData = await response.json();
      console.error("HTTP Error:", response.status, response.statusText);
      console.error("Error Details:", errorData.error);
      throw new Error(
        "Failed to fetch data: " + errorData.message || response.statusText
      );
    }
    console.log(`${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log(data);
    setIframe(data["credit_card_payment_page"]["url"]);
  } catch (error) {
    console.error(error);
  }
}

function getInput() {
  clientId = document.getElementById("client-id").value;
  secretKey = document.getElementById("secret-key").value;

  if (clientId.length === 0 && secretKey.length === 0) {
    const msg =
      'Please input your "client-id" & "secret-key" of your sandbox account.';
    alert(msg);
    throw new Error(msg);
  }
}

function setIframe(url) {
  console.log(url);
  var urlNewStyle = url.replace(
    "backgroundColor=F5F8FB",
    "backgroundColor=FFFFFF"
  );
  var box = document.getElementById("box");
  box.innerHTML = `<iframe width="400" height="400" frameborder="0" title="description" src=${urlNewStyle}></iframe>`;
}

function prepare() {
  requestId = crypto.randomUUID();
  requestTimestamp = new Date().toISOString().slice(0, 19) + "Z";
  url = environmentUrl + requestTarget;
  setBody();
  setDigest();
  setSignature();
  setHeader();
  // console.log(digest);
  // console.log(rawSignature);
  // console.log(url);
  // headers.entries().forEach((data) => console.log(data));
  // console.log(body);
}

function setDigest() {
  digest = CryptoJS.enc.Base64.stringify(CryptoJS.SHA256(body));
}

function setSignature() {
  rawSignature =
    "Client-Id:" +
    clientId +
    "\n" +
    "Request-Id:" +
    requestId +
    "\n" +
    "Request-Timestamp:" +
    requestTimestamp +
    "\n" +
    "Request-Target:" +
    requestTarget +
    "\n" +
    "Digest:" +
    digest;
  signature = CryptoJS.enc.Base64.stringify(
    CryptoJS.HmacSHA256(rawSignature, secretKey)
  );
}

function setHeader() {
  headers.append("Content-Type", "application/json");
  headers.append("Request-Id", requestId);
  headers.append("Client-Id", clientId);
  headers.append("Request-Timestamp", requestTimestamp);
  headers.append("Signature", "HMACSHA256=" + signature);
}

function setBody() {
  // ! -----> use pretty-print
  // body = JSON.stringify(jsonData, null, 2);
  // body = JSON.stringify(jsonData, null, 4);
  body = JSON.stringify(dataBody, null, "\t");
}

var dataBody = {
  order: {
    invoice_number: "INV-2025527-1750957364761",
    amount: 90000,
    line_items: [
      {
        name: "T-Shirt Red",
        price: 30000,
        quantity: 2,
      },
      {
        name: "Polo Navy",
        price: 30000,
        quantity: 1,
      },
    ],
    callback_url: "https://merchant.com/success-url",
    failed_url: "https://merchant.com/failed-url",
    auto_redirect: false,
  },
  card: {
    save: false,
  },
  customer: {
    id: "CUST-0001",
    name: "Anton Budiman",
    email: "anton@example.com",
    phone: "6285694566147",
    address: "Menara Mulia Lantai 8",
    country: "ID",
  },
  override_configuration: {
    themes: {
      language: "EN",
      background_color: "F5F8FB",
      font_color: "1A1A1A",
      button_background_color: "E1251B",
      button_font_color: "FFFFFF",
    },
    promo: [
      {
        bin: "142498",
        discount_amount: 20000,
      },
      {
        bin: "314498",
        discount_amount: 20000,
      },
      {
        bin: "091234",
        discount_amount: 10000,
      },
      {
        bin: "091234",
        discount_amount: 10000,
      },
    ],
    allow_bin: ["461700", "410505", "557338"],
    allow_tenor: [0, 3, 6],
  },
};
