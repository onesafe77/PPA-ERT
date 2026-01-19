// Test API Login Endpoint
async function testLogin() {
    console.log('🔍 Testing Login API...\n');

    try {
        const response = await fetch('http://localhost:3001/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                employeeId: '23001138',
                password: '12345678'
            })
        });

        const data = await response.json();

        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(data, null, 2));

        if (data.success) {
            console.log('\n✅ Login API: SUCCESS');
            console.log('User:', data.user);
        } else {
            console.log('\n❌ Login API: FAILED');
            console.log('Message:', data.message);
        }

    } catch (error: any) {
        console.error('\n❌ Connection FAILED!');
        console.error('Error:', error.message);
        console.error('\n🔧 Make sure backend server is running on port 3001');
    }
}

testLogin();
