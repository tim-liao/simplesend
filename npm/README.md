# simplesend v1.0.6

user our [web site](https://side-project2023.online/) to send email simple!!

## Installation

Using npm:

```shell
$ npm i simplesend
$ npm install simplesend
```

In Node.js(ESM):

```js
import { sendemailwithattachment, sendonlyemail } from "simplesend";
const body = {
  user_id: 0, //your user ID //required
  nameFrom: "example.com", // your verify name //required
  emailTo: "email@example.com", //required
  // emailBcc: "email@example.com",
  emailCc: "email@example.com",
  // emailReplyTo: "email@example.com",
  emailSubject: `example`, //required
  emailBodyType: "html", //required //'html' or 'text'
  emailBodyContent: `
    <a href="https://google.com">google</a>`, //required
  trackingOpen: "yes", //required  //'yes' or 'no'
  trackingClick: "yes", //required  //'yes' or 'no'
  trackingLink: "https://google.com", //if you want to track your click ,you have to provide the link you want to track in your html content
};
const apiKey = "your api key it will provide from our web service";
const filePath = "your/file/path";
//send email with attachment
sendemailwithattachment(body, filePath, apiKey);

// without attachment
sendonlyemail(body, apiKey);
```

**Note:**<br>
user our [web site](https://side-project2023.online/) to send email simple!!
