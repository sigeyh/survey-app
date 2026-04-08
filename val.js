const fetch = require('node-fetch'); // we use node native fetch, so no require needed.
async function getRedirect() {
    const res = await fetch("https://short.payhero.co.ke/s/cNQKbWqAMQbmh72LRmLXmk", { redirect: 'manual' });
    console.log("Status:", res.status);
    console.log("Location:", res.headers.get('location'));
}
getRedirect();
