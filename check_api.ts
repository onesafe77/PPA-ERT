
async function testApi() {
    console.log('--- Testing API Endpoint ---');
    try {
        const response = await fetch('http://localhost:3000/api/apar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                date: new Date(),
                location: 'API_TEST',
                unitNumber: 'API_UNIT',
                capacity: '6 Kg',
                tagNumber: 'API_TAG',
                checklistData: '{}',
                condition: 'LAYAK',
                notes: 'API Test Note',
                pic: 'API Tester',
                userId: null
            })
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Body:', text);

        if (response.ok) {
            console.log('✅ API Call Successful');
        } else {
            console.log('❌ API Call Failed');
        }

    } catch (error) {
        console.error('❌ Network/Fetch Error:', error.cause || error);
    }
}

testApi();
