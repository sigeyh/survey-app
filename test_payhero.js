async function testPayHero() {
    const url = 'https://backend.payhero.co.ke/api/v2/payments';
    
    const apiUsername = 'rsigeyh28@gmail.com';
    const apiPassword = '37128428Rs.';
    
    const credentials = Buffer.from(`${apiUsername}:${apiPassword}`).toString('base64');
    
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${credentials}`
            },
            body: JSON.stringify({
                amount: 10,
                phone_number: '254712345678',
                channel_id: 6770,
                provider: 'm-pesa',
                external_reference: 'TEST-12345',
                callback_url: 'http://localhost:3001/api/payhero/webhook'
            })
        });
        
        let data;
        try { data = await res.json(); } catch(e) { data = await res.text(); }
        console.log(`Status:`, res.status, data);
    } catch(err) {
        console.error(`Error:`, err.message);
    }
}
testPayHero();
