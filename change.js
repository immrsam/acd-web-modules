// =============================================
// EXISTING CODE (DO NOT MODIFY THESE SECTIONS)
// =============================================

let jsonData;

function getData(url, cb) {
    fetch(url)
        .then(response => response.json())
        .then(result => cb(result))
        .catch(error => console.error('Error loading data:', error));
}

function populateTable() {
    const tableBody = document.querySelector('#datatable tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    for (const orderId in jsonData.orders) {
        const order = jsonData.orders[orderId];
        const row = document.createElement('tr');
        
        // SOP column
        const sopCell = document.createElement('td');
        sopCell.textContent = order.SOP;
        row.appendChild(sopCell);
        
        // Written Up column
        const writtenUpCell = document.createElement('td');
        writtenUpCell.textContent = order['WRITTEN-UP'] ? 'Yes' : 'No';
        row.appendChild(writtenUpCell);
        
        // Factory Issued column
        const factoryIssuedCell = document.createElement('td');
        factoryIssuedCell.textContent = order['ISSUED-TO-FACTORY'] ? 'Yes' : 'No';
        row.appendChild(factoryIssuedCell);
        
        tableBody.appendChild(row);
    }
}

// Initialize the page
getData('./test.json', (data) => {
    jsonData = data;
    populateTable();
});

// =============================================
// NEW ORDER CREATION FUNCTIONALITY (ADD THIS AT THE END)
// =============================================

// Only activate on new-order.html
if (window.location.pathname.includes('Scan.html')) {
    const orderForm = document.getElementById('orderForm');
    const exportBtn = document.getElementById('exportBtn');
    const messageDiv = document.getElementById('message');

    // Load existing data if available
    if (!jsonData) {
        jsonData = JSON.parse(localStorage.getItem('orderData')) || { orders: {} };
    }

    // Order form handler
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const sop = document.getElementById('sop').value.trim();
            
            if (!sop) {
                showMessage('Please enter a valid SOP', 'error');
                return;
            }

            if (jsonData.orders[sop]) {
                showMessage(`Order ${sop} already exists`, 'warning');
                return;
            }

            // Create new order matching existing structure
            jsonData.orders[sop] = {
                SOP: parseInt(sop),
                'WRITTEN-UP': false,
                'ISSUED-TO-FACTORY': false,
                'FACTORY-COMPLETE': false,
                'DISPATCH': null,
                'LOGS': {}
            };

            showMessage(`Order ${sop} created successfully!`, 'success');
            localStorage.setItem('orderData', JSON.stringify(jsonData));
            orderForm.reset();
        });
    }

    // Export handler
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            const dataStr = JSON.stringify(jsonData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'test.json';
            document.body.appendChild(a);
            a.click();
            
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
        });
    }

    // Helper function
    function showMessage(text, type) {
        if (!messageDiv) return;
        messageDiv.textContent = text;
        messageDiv.className = type;
    }
}