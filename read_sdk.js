const fs = require('fs');
async function run() {
  const content = await fetch("https://applet.payherokenya.com/cdn/button_sdk.js?v=3.1").then(r => r.text());
  console.log(content.slice(-300));
}
run();
