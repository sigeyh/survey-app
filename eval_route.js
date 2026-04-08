async function checkRoute() {
    console.log("Hitting the local API route...");
    try {
        const res = await fetch("http://localhost:3001/api/payhero", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                amount: 200,
                phoneNumber: "0712345678",
                reference: "TEST-PAYMENT-123",
                description: "Test Payment"
            })
        });

        const json = await res.json();
        console.log("Response:", JSON.stringify(json, null, 2));
    } catch(err) {
        console.error("Fetch failed:", err);
    }
}
checkRoute();
