// ======================
// CORE DATA AND UTILITIES
// ======================
const url = './test.json';
let jsonData;

const locationOptions = {
    "OFFICE": ["WRITTEN-UP", "ISSUED-FACTORY", "FACTORY-COMPLETE"],
    "FIRE-DOORS": ["BEAM-SAW", "WALL-SAW", "PANEL-SAW", "COLD-PRESS", "HOT-PRESS", 
                  "SPINDLE-MOULDER", "UPCUT-SAW", "FRAMING", "HAND-TOOLS"],
    "DET": ["DET-MACHINE", "HAND-TOOLS"],
    "FACTORY-8": ["CNC", "EDGE-RUNNER", "HAND-TOOLS", "UPCUT-SAW"],
    "NON-RATED": ["BEAM-SAW", "WALL-SAW", "PANEL-SAW", "COLD-PRESS", 
                 "UPCUT-SAW", "FRAMING", "HAND-TOOLS"],
    "DESPATCH": ["WRAPPED", "SENT"]
};

function getData(url, cb) {
    fetch(url)
        .then(response => response.json())
        .then(result => cb(result))
        .catch(error => console.error('Error loading data:', error));
}

function showMessage(text, elementId = 'messageDiv') {
    const messageDiv = document.getElementById(elementId);
    if (messageDiv) messageDiv.textContent = text;
}

function getCurrentTime() {
    const now = new Date();
    return String(now.getHours()).padStart(2, '0') + 
           String(now.getMinutes()).padStart(2, '0');
}

function getDuration(start, end) {
    let result = parseInt(end) - parseInt(start);
    return result < 1 ? 1 : result;
}

// ======================
// LOCATION FUNCTIONALITY
// ======================
function updateOptions() {
    const locationInput = document.getElementById('location');
    const subOptionDatalist = document.getElementById('sub-options');
    
    if (!locationInput || !subOptionDatalist) {
        console.error('Location elements missing');
        return;
    }
    
    subOptionDatalist.innerHTML = '';
    const selectedLocation = locationInput.value;
    
    if (locationOptions[selectedLocation]) {
        locationOptions[selectedLocation].forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            subOptionDatalist.appendChild(optionElement);
        });
    }
}

function initializeLocationHandlers() {
    const locationInput = document.getElementById('location');
    if (locationInput) {
        locationInput.addEventListener('change', updateOptions);
        if (locationInput.value) updateOptions();
    }
}

// ======================
// SCAN PAGE FUNCTIONALITY
// ======================
function setupScanPage() {
    console.log("Scan loaded");
    
    const orderForm = document.getElementById('orderForm');
    const exportBtn = document.getElementById('exportBtn');

    if (!jsonData) {
        jsonData = JSON.parse(localStorage.getItem('orderData')) || { orders: {} };
    }

    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const sop = document.getElementById('sop').value.trim();
            const user = document.getElementById('user').value.trim();
            const lineSelect = document.getElementById('lineSelect').value.trim();
            const area = document.getElementById('location').value.trim();
            const subArea = document.getElementById('sub-option').value.trim();
            const startTime = document.getElementById('startTimeInput').value.trim();
            const endTime = document.getElementById('endTimeInput').value.trim();
            const notes = document.getElementById('notesInput').value.trim();
            const statusInput = document.getElementById('statusInput').value.trim();

            if (!sop) {
                showMessage('Please enter a valid SOP');
                return;
            }

            if (jsonData.orders[sop]) {
                const now = new Date();
                const timestamp = now.getFullYear().toString() + 
                    String(now.getMonth() + 1).padStart(2, '0') + 
                    String(now.getDate()).padStart(2, '0') + 
                    String(now.getHours()).padStart(2, '0') + 
                    String(now.getMinutes()).padStart(2, '0');
                
                const date = String(now.getDate()).padStart(2, '0') + '/' + 
                    String(now.getMonth() + 1).padStart(2, '0') + '/' + 
                    now.getFullYear() + ' ' + 
                    String(now.getHours()).padStart(2, '0') + ':' +
                    String(now.getMinutes()).padStart(2, '0');

                const newLog = {
                    "DATE": date,
                    "USER": user,
                    "AREA": subArea + ' - ' + area,
                    "LINE": lineSelect,
                    "STARTTIME": startTime,
                    "ENDTIME": endTime,
                    "DURATION": getDuration(startTime, endTime),
                    "STATUS": statusInput,
                    "NOTES": notes
                };

                jsonData.orders[sop].LOGS[timestamp] = newLog;
                localStorage.setItem('orderData', JSON.stringify(jsonData));
                showMessage(`Order ${sop} updated successfully!`);
                orderForm.reset();
                return;
            }

            showMessage(`Order ${sop} not in system`);
        });
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            const rawData = localStorage.getItem('orderData');
            try {
                const dataStr = JSON.stringify(JSON.parse(rawData), null, 2);
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
            } catch (e) {
                showMessage('Error exporting data: ' + e.message);
                console.error('Export error:', e);
            }
        });
    }

    // Timer functionality
    let timerStarted = false;
    let startTime = "";
    document.getElementById('startTimer').addEventListener('click', function() {
        timerStarted = true;
        startTime = getCurrentTime();
        document.getElementById('startTimeInput').value = startTime;
    });
    
    document.getElementById('endTimer').addEventListener('click', function() {
        if (!timerStarted) {
            document.getElementById('endTime').innerHTML = "Start timer first";
            return;
        }
        const endTime = getCurrentTime();
        document.getElementById('endTimeInput').value = endTime;
    });
}

// ======================
// JOB LIST PAGE FUNCTIONALITY
// ======================
function populateData() {
  const tableBody = document.querySelector('#dataTable tbody');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  for (const orderId in jsonData.orders) {
      const order = jsonData.orders[orderId];
      const row = document.createElement('tr');

      // SOP Cell (unchanged)
      const sopCell = document.createElement('td');
      const sopLink = document.createElement('a');
      sopLink.href = `results.html?sop=${order.SOP}`;
      sopLink.textContent = order.SOP;
      sopCell.appendChild(sopLink);
      row.appendChild(sopCell);
      
      // Status Cells (unchanged)
      row.appendChild(createStatusCell(order['WRITTEN-UP']));
      row.appendChild(createStatusCell(order['ISSUED-TO-FACTORY']));
      row.appendChild(createStatusCell(order['FACTORY-COMPLETE']));
      
      // Location and Date Cells - FINAL WORKING VERSION
      const locationCell = document.createElement('td');
      const dateCell = document.createElement('td');
      
      if (order.LOGS && Object.keys(order.LOGS).length > 0) {
          // Convert logs to array and sort by actual DATE field
          const logEntries = Object.entries(order.LOGS);
          
          logEntries.sort((a, b) => {
              // Parse dates into comparable format
              const dateA = parseLogDate(a[1].DATE);
              const dateB = parseLogDate(b[1].DATE);
              return dateB - dateA; // Newest first
          });
          
          const newestLog = logEntries[0][1];
          locationCell.textContent = newestLog.AREA || "-";
          dateCell.textContent = newestLog.DATE || "-";
      } else {
          locationCell.textContent = "-";
          dateCell.textContent = "-";
      }
      
      row.appendChild(locationCell);
      row.appendChild(dateCell);
      
      // Dispatch Cell (unchanged)
      const dispatchCell = document.createElement('td');
      dispatchCell.textContent = order.DISPATCH || "-";
      row.appendChild(dispatchCell);

      tableBody.appendChild(row);
  }
}

// Helper function to parse both date formats
function parseLogDate(dateString) {
  const [datePart, timePart] = dateString.split(' ');
  const [day, month, year] = datePart.split('/');
  const [hours, minutes] = timePart.split(':');
  
  // Create Date object (months are 0-indexed)
  return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes)
  );
}

// Helper function for status cells
function createStatusCell(value) {
  const cell = document.createElement('td');
  cell.textContent = value ? 'Yes' : 'No';
  return cell;
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('#dataTable tbody tr');
        let hasResults = false;
        
        rows.forEach(row => {
            const sopCell = row.cells[0];
            const sopText = sopCell.textContent.toLowerCase();
            
            if (sopText.includes(searchTerm)) {
                row.style.display = '';
                hasResults = true;
            } else {
                row.style.display = 'none';
            }
        });
        
        const noResults = document.getElementById('noResults');
        if (noResults) noResults.style.display = hasResults ? 'none' : 'block';
    });
}

// ======================
// ORDER DETAILS PAGE
// ======================
function displayOrderDetails() {
    if (!window.location.pathname.includes('results.html')) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const sop = urlParams.get('sop');
    const order = jsonData.orders[sop];
    
    document.getElementById('sop-number').textContent = `SOP: ${order.SOP}`;
    const tableBody = document.querySelector('#logTable tbody');
    tableBody.innerHTML = '';
    
    if (order.LOGS && Object.keys(order.LOGS).length > 0) {
        for (const logId in order.LOGS) {
            const log = order.LOGS[logId];
            const row = document.createElement('tr');
            
            // Create cells for each log property
            ['DATE', 'USER', 'AREA', 'LINE', 'STARTTIME', 'ENDTIME', 'DURATION', 'STATUS', 'NOTES'].forEach(prop => {
                const cell = document.createElement('td');
                cell.textContent = log[prop] || "-";
                row.appendChild(cell);
            });
            
            tableBody.appendChild(row);
        }
    }
}

// ======================
// NEW JOB PAGE
// ======================
function setupNewJobPage() {
    console.log("New Job Loaded");
    const orderForm = document.getElementById('orderForm');
    const exportBtn = document.getElementById('exportBtn');

    if (!jsonData) {
        jsonData = JSON.parse(localStorage.getItem('orderData')) || { orders: {} };
    }

    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const sop = document.getElementById('sopNumber').value.trim();
            const user = document.getElementById('user').value.trim();
            const writtenUp = document.getElementById('writtenUp').checked;
            const notes = document.getElementById('notesInput').value.trim();
            
            if (!sop) {
                showMessage('Please enter a valid SOP');
                return;
            }

            if (!jsonData.orders[sop]) {
                const now = new Date();
                const timestamp = now.getFullYear().toString() + 
                    String(now.getMonth() + 1).padStart(2, '0') + 
                    String(now.getDate()).padStart(2, '0') + 
                    String(now.getHours()).padStart(2, '0') + 
                    String(now.getMinutes()).padStart(2, '0');
                
                const date = String(now.getDate()).padStart(2, '0') + '/' + 
                    String(now.getMonth() + 1).padStart(2, '0') + '/' + 
                    now.getFullYear() + ' ' + 
                    String(now.getHours()).padStart(2, '0') + ':' +
                    String(now.getMinutes()).padStart(2, '0');

                jsonData.orders[sop] = {
                    SOP: parseInt(sop),
                    'WRITTEN-UP': writtenUp ? "Yes" : "No",
                    'ISSUED-TO-FACTORY': false,
                    'FACTORY-COMPLETE': false,
                    'DISPATCH': null,
                    'LOGS': {}
                };

                const newLog = {
                    "DATE": date,
                    "USER": user,
                    "AREA": "Office - " + (writtenUp ? "WRITTEN-UP" : ""),
                    "LINE": null,
                    "STARTTIME": getCurrentTime(),
                    "ENDTIME": getCurrentTime(),
                    "DURATION": 0,
                    "STATUS": "COMPLETE",
                    "NOTES": notes
                };

                jsonData.orders[sop].LOGS[timestamp] = newLog;
                localStorage.setItem('orderData', JSON.stringify(jsonData));
                showMessage(`Order ${sop} created successfully!`);
                orderForm.reset();
            } else {
                showMessage(`Order ${sop} already in system`);
            }
        });
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            const rawData = localStorage.getItem('orderData');
            try {
                const dataStr = JSON.stringify(JSON.parse(rawData), null, 2);
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
            } catch (e) {
                showMessage('Error exporting data: ' + e.message);
                console.error('Export error:', e);
            }
        });
    }
}

// ======================
// INITIALIZATION
// ======================
document.addEventListener('DOMContentLoaded', () => {
    getData('./test.json', (data) => {
        jsonData = data;
        
        if (window.location.pathname.includes('results.html')) {
            displayOrderDetails();
        } 
        else if (window.location.pathname.includes('JobList.html')) {
            populateData();
            setupSearch();
        } 
        else if (window.location.pathname.includes('Scan.html')) {
            initializeLocationHandlers();
            setupScanPage();
        }
        else if (window.location.pathname.includes('newJob.html')) {
            setupNewJobPage();
        }
    });
});