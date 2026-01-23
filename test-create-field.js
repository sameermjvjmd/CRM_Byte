// Quick API Test - Run this in browser console
// This will test creating a custom field directly via API

async function testCreateField() {
    const payload = {
        DisplayName: "Budget",
        FieldName: "budget",
        FieldType: 12, // Currency
        EntityType: "Contact",
        IsRequired: true,
        IsActive: true,
        CreatedBy: 1,
        DisplayOrder: 0
    };

    console.log('📤 Testing with payload:', payload);

    try {
        const response = await fetch('http://localhost:5000/api/customfields', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log('📊 Response status:', response.status);

        const data = await response.json();
        console.log('📦 Response data:', data);

        if (response.ok) {
            console.log('✅ SUCCESS! Field created:', data);
        } else {
            console.error('❌ FAILED:', data);
        }
    } catch (error) {
        console.error('❌ Network error:', error);
    }
}

// Run the test
testCreateField();
