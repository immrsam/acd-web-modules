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

// Cache DOM elements
const domCache = {
    messageDiv: document.getElementById('messageDiv'),
    locationInput: document.getElementById('location'),
    subOptionDatalist: document.getElementById('sub-options')
};

/**
 * Fetches data from a URL and passes it to a callback
 * @param {string} url - The URL to fetch data from
 * @param {function} cb - Callback function to handle the data
 */
async function getData(url, cb) {
    try {
        const response = await fetch(url);
        const result = await response.json();
        cb(result);
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

/**
 * Displays a message in the specified element
 * @param {string} text - The message to display
 * @param {string} elementId - The ID of the element to display the message in
 */
function showMessage(text, elementId = 'messageDiv') {
    const element = domCache[elementId] || document.getElementById(elementId);
    if (element) element.textContent = text;
}

/**
 * Gets the current time in HHMM format
 * @returns {string} Current time as HHMM
 */
function getCurrentTime() {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + 
           now.getMinutes().toString().padStart(2, '0');
}

/**
 * Calculates duration between two times
 * @param {string} start - Start time in HHMM format
 * @param {string} end - End time in HHMM format
 * @returns {number} Duration in minutes (minimum 1)
 */
function getDuration(start, end) {
    const result = parseInt(end, 10) - parseInt(start, 10);
    return result < 1 ? 1 : result;
}

/**
 * Prevents form submission on Enter key and moves to next input
 * @param {HTMLElement} inputElement - The input element to attach the handler to
 */
function preventSubmitOnEnter(inputElement) {
    inputElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const form = inputElement.form;
            const inputs = Array.from(form.querySelectorAll('input:not([type="hidden"]), select, textarea'));
            const currentIndex = inputs.indexOf(inputElement);
            if (currentIndex < inputs.length - 1) {
                inputs[currentIndex + 1].focus();
            }
        }
    });
}

/**
 * Creates a formatted date string
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string (DD/MM/YYYY HH:MM)
 */
function formatDate(date) {
    return [
        date.getDate().toString().padStart(2, '0'),
        (date.getMonth() + 1).toString().padStart(2, '0'),
        date.getFullYear()
    ].join('/') + ' ' + [
        date.getHours().toString().padStart(2, '0'),
        date.getMinutes().toString().padStart(2, '0')
    ].join(':');
}

/**
 * Creates a timestamp string from a Date object
 * @param {Date} date - Date object to convert
 * @returns {string} Timestamp string (YYYYMMDDHHmm)
 */
function createTimestamp(date) {
    return [
        date.getFullYear(),
        (date.getMonth() + 1).toString().padStart(2, '0'),
        date.getDate().toString().padStart(2, '0'),
        date.getHours().toString().padStart(2, '0'),
        date.getMinutes().toString().padStart(2, '0')
    ].join('');
}

// ======================
// LOCATION FUNCTIONALITY
// ======================

/**
 * Updates the sub-options datalist based on selected location
 */
function updateOptions() {
    if (!domCache.locationInput || !domCache.subOptionDatalist) {
        console.error('Location elements missing');
        return;
    }
    
    domCache.subOptionDatalist.innerHTML = '';
    const selectedLocation = domCache.locationInput.value;
    
    if (locationOptions[selectedLocation]) {
        locationOptions[selectedLocation].forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            domCache.subOptionDatalist.appendChild(optionElement);
        });
    }
}

/**
 * Initializes location input handlers
 */
function initializeLocationHandlers() {
    if (domCache.locationInput) {
        domCache.locationInput.addEventListener('change', updateOptions);
        if (domCache.locationInput.value) updateOptions();
    }
}

// ======================
// SCAN PAGE FUNCTIONALITY
// ======================

/**
 * Handles new order creation
 * @param {string} sop - SOP number
 * @param {string} rating - Order rating
 * @param {string} user - User name
 * @param {boolean} writtenUp - Whether order is written up
 * @param {string} notes - Additional notes
 */
function createNewOrder(sop, rating, user, writtenUp, notes) {
    const now = new Date();
    const timestamp = createTimestamp(now);
    const date = formatDate(now);

    jsonData.orders[`${sop}-${rating}`] = {
        SOP: parseInt(sop, 10),
        RATING: rating,
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

    jsonData.orders[`${sop}-${rating}`].LOGS[timestamp] = newLog;
    localStorage.setItem('orderData', JSON.stringify(jsonData));
    showMessage(`Order ${sop} (${rating}) created successfully!`);
}

/**
 * Handles existing order updates
 * @param {string} orderKey - Order key (SOP-RATING)
 * @param {object} formData - Form data object
 */
function updateExistingOrder(orderKey, formData) {
    const now = new Date();
    const timestamp = createTimestamp(now);
    const date = formatDate(now);

    const newLog = {
        "DATE": date,
        "USER": formData.user,
        "AREA": formData.area + ' - ' + formData.subArea,
        "LINE": formData.lineSelect,
        "STARTTIME": formData.startTime,
        "ENDTIME": formData.endTime,
        "DURATION": getDuration(formData.startTime, formData.endTime),
        "STATUS": formData.statusInput,
        "NOTES": formData.notes
    };

    jsonData.orders[orderKey].LOGS[timestamp] = newLog;
    localStorage.setItem('orderData', JSON.stringify(jsonData));
    showMessage(`Order ${formData.sop} (${formData.rating}) updated successfully!`);
}

/**
 * Exports data to JSON file
 */
function exportData() {
    try {
        const rawData = localStorage.getItem('orderData');
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
}

/**
 * Sets up the scan page functionality
 */
function setupScanPage() {
    console.log("Scan loaded");
    
    const orderForm = document.getElementById('orderForm');
    const exportBtn = document.getElementById('exportBtn');
    const newOrderModal = document.getElementById('newOrderModal');
    const newOrderForm = document.getElementById('newOrderForm');
    const cancelNewOrderBtn = document.getElementById('cancelNewOrder');
    const closeModalBtn = document.querySelector('.close-modal');

    if (!jsonData) {
        jsonData = JSON.parse(localStorage.getItem('orderData')) || { orders: {} };
    }

    // Timer functionality
    let timerStarted = false;
    let startTime = "";
    document.getElementById('startTimer')?.addEventListener('click', () => {
        timerStarted = true;
        startTime = getCurrentTime();
        document.getElementById('startTimeInput').value = startTime;
    });
    
    document.getElementById('endTimer')?.addEventListener('click', () => {
        if (!timerStarted) {
            document.getElementById('endTime').textContent = "Start timer first";
            return;
        }
        const endTime = getCurrentTime();
        document.getElementById('endTimeInput').value = endTime;
    });

    // Modal functions
    const hideNewOrderModal = () => {
        newOrderModal.style.display = 'none';
        newOrderForm?.reset();
    };

    const showNewOrderModal = (sop, rating) => {
        document.getElementById('newSop').value = sop;
        document.getElementById('newRating').value = rating;
        document.getElementById('newUser').value = document.getElementById('user').value;
        newOrderModal.style.display = 'block';
    };

    // Modal event listeners
    closeModalBtn?.addEventListener('click', hideNewOrderModal);
    cancelNewOrderBtn?.addEventListener('click', hideNewOrderModal);
    window.addEventListener('click', (event) => {
        if (event.target === newOrderModal) {
            hideNewOrderModal();
        }
    });

    // New order form submission
    newOrderForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const sop = document.getElementById('newSop').value.trim();
        const rating = document.getElementById('newRating').value.trim();
        const user = document.getElementById('newUser').value.trim();
        const writtenUp = document.getElementById('newWrittenUp').checked;
        const notes = document.getElementById('newNotes').value.trim();

        const now = new Date();
        const timestamp = createTimestamp(now);
        const date = formatDate(now);

        jsonData.orders[`${sop}-${rating}`] = {
            SOP: parseInt(sop, 10),
            RATING: rating,
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

        jsonData.orders[`${sop}-${rating}`].LOGS[timestamp] = newLog;
        localStorage.setItem('orderData', JSON.stringify(jsonData));
        
        showMessage(`Order ${sop} (${rating}) created successfully!`);
        hideNewOrderModal();
    });

    // Main order form submission
    // Main order form submission
    orderForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
            sop: document.getElementById('sop').value.trim(),
            user: document.getElementById('user').value.trim(),
            lineSelect: document.getElementById('lineSelect').value.trim(),
            area: document.getElementById('location').value.trim(),
            subArea: document.getElementById('sub-option').value.trim(),
            startTime: document.getElementById('startTimeInput').value.trim(),
            endTime: document.getElementById('endTimeInput').value.trim(),
            notes: document.getElementById('notesInput').value.trim(),
            statusInput: document.getElementById('statusInput').value.trim(),
            rating: document.getElementById('ratingSelect').value.trim()
        };

        if (!formData.sop) {
            showMessage('Please enter a valid SOP');
            return;
        }

        const orderKey = `${formData.sop}-${formData.rating}`;

        // If order doesn't exist, show modal REGARDLESS of scan type
        if (!jsonData.orders[orderKey]) {
            showNewOrderModal(formData.sop, formData.rating);
            return;
        }

        const now = new Date();
        const timestamp = createTimestamp(now);
        const date = formatDate(now);

        const newLog = {
            "DATE": date,
            "USER": formData.user,
            "AREA": `${formData.area} - ${formData.subArea}`,
            "LINE": formData.lineSelect,
            "STARTTIME": formData.startTime,
            "ENDTIME": formData.endTime,
            "DURATION": getDuration(formData.startTime, formData.endTime),
            "STATUS": formData.statusInput,
            "NOTES": formData.notes
        };

        // Update status if order exists
        switch (`${formData.area}-${formData.subArea}`) {
            case 'OFFICE-WRITTEN-UP':
                jsonData.orders[orderKey]['WRITTEN-UP'] = "Yes";
                break;
            case 'OFFICE-ISSUED-FACTORY':
                if (jsonData.orders[orderKey]['WRITTEN-UP'] === "Yes") {
                    jsonData.orders[orderKey]['ISSUED-TO-FACTORY'] = "Yes";
                } else {
                    showMessage('Order must be written up before issuing to factory');
                    return;
                }
                break;
            case 'OFFICE-FACTORY-COMPLETE':
                if (jsonData.orders[orderKey]['ISSUED-TO-FACTORY']) {
                    jsonData.orders[orderKey]['FACTORY-COMPLETE'] = "Yes";
                } else {
                    showMessage('Order must be issued to factory before completion');
                    return;
                }
                break;
            case 'DESPATCH-WRAPPED':
            case 'DESPATCH-SENT':
                if (jsonData.orders[orderKey]['FACTORY-COMPLETE']) {
                    jsonData.orders[orderKey]['DISPATCH'] = formData.subArea;
                } else {
                    showMessage('Order must be factory complete before dispatch');
                    return;
                }
                break;
        }

        // Add the log entry
        jsonData.orders[orderKey].LOGS[timestamp] = newLog;
        localStorage.setItem('orderData', JSON.stringify(jsonData));
        
        showMessage(`Order ${formData.sop} (${formData.rating}) updated successfully!`);
        orderForm.reset();
    });

    // Export button
    exportBtn?.addEventListener('click', exportData);
}

/**
 * Creates a status cell with Yes/No text
 * @param {*} value - The value to evaluate
 * @returns {HTMLTableCellElement} The created cell
 */
function createStatusCell(value) {
    const cell = document.createElement('td');
    if(!value) {cell.textContent = "No";}
     else cell.textContent = value;
    return cell;
}

/**
 * Parses a log date string into a Date object
 * @param {string} dateString - Date string in DD/MM/YYYY HH:MM format
 * @returns {Date} Parsed Date object
 */
function parseLogDate(dateString) {
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/');
    const [hours, minutes] = timePart.split(':');
    
    return new Date(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10),
        parseInt(hours, 10),
        parseInt(minutes, 10)
    );
}

/**
 * Populates the data table with order information
 */
function populateData() {
    const tableBody = document.querySelector('#dataTable tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    for (const orderKey in jsonData.orders) {
        const order = jsonData.orders[orderKey];
        const row = document.createElement('tr');

        // SOP Cell with link
        const sopCell = document.createElement('td');
        const sopLink = document.createElement('a');
        sopLink.href = `results.html?sop=${order.SOP}&rating=${order.RATING}`;
        sopLink.textContent = order.SOP;
        sopCell.appendChild(sopLink);
        row.appendChild(sopCell);
        
        // RATING Cell
        const ratingCell = document.createElement('td');
        ratingCell.textContent = order.RATING;
        row.appendChild(ratingCell);

        // Status Cells
        row.appendChild(createStatusCell(order['WRITTEN-UP']));
        row.appendChild(createStatusCell(order['ISSUED-TO-FACTORY']));
        row.appendChild(createStatusCell(order['FACTORY-COMPLETE']));
        console.log(`SOP: ${orderKey}\nWRITTEN-UP: ${order['WRITTEN-UP']}\nISSUED-TO-FACTORY: ${order['ISSUED-TO-FACTORY']}\nFACTORY-COMPLETE: ${order['FACTORY-COMPLETE']}`);
        
        // Location and Date Cells
        const locationCell = document.createElement('td');
        const dateCell = document.createElement('td');
        
        if (order.LOGS && Object.keys(order.LOGS).length > 0) {
            const logEntries = Object.entries(order.LOGS);
            logEntries.sort((a, b) => parseLogDate(b[1].DATE) - parseLogDate(a[1].DATE));
            
            const newestLog = logEntries[0][1];
            locationCell.textContent = newestLog.AREA || "-";
            dateCell.textContent = newestLog.DATE || "-";
        } else {
            locationCell.textContent = "-";
            dateCell.textContent = "-";
        }
        
        row.appendChild(locationCell);
        row.appendChild(dateCell);
        
        // Dispatch Cell
        const dispatchCell = document.createElement('td');
        dispatchCell.textContent = order.DISPATCH || "-";
        row.appendChild(dispatchCell);

        tableBody.appendChild(row);
    }
}

/**
 * Sets up search functionality for the job list
 */
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('#dataTable tbody tr');
        let hasResults = false;
        
        rows.forEach(row => {
            const sopText = row.cells[0].textContent.toLowerCase();
            row.style.display = sopText.includes(searchTerm) ? '' : 'none';
            if (sopText.includes(searchTerm)) hasResults = true;
        });
        
        const noResults = document.getElementById('noResults');
        if (noResults) noResults.style.display = hasResults ? 'none' : 'block';
    });
}

// ======================
// ORDER DETAILS PAGE
// ======================

/**
 * Displays order details on the results page
 */
function displayOrderDetails() {
    if (!window.location.pathname.includes('results.html')) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const sop = urlParams.get('sop');
    const rating = urlParams.get('rating');
    
    if (!sop || !rating) {
        document.getElementById('sop-number').textContent = 'Missing SOP or RATING in URL';
        return;
    }
    
    const orderKey = `${sop}-${rating}`;
    const order = jsonData.orders[orderKey];
    
    if (!order) {
        document.getElementById('sop-number').textContent = `Order ${sop} (${rating}) not found!`;
        return;
    }
    
    document.getElementById('sop-number').textContent = `SOP: ${order.SOP} (${order.RATING})`;
    const tableBody = document.querySelector('#logTable tbody');
    tableBody.innerHTML = '';
    
    if (order.LOGS && Object.keys(order.LOGS).length > 0) {
        const logEntries = Object.entries(order.LOGS);
        logEntries.sort((a, b) => parseLogDate(b[1].DATE) - parseLogDate(a[1].DATE));
        
        const properties = ['DATE', 'USER', 'AREA', 'LINE', 'STARTTIME', 'ENDTIME', 'DURATION', 'STATUS', 'NOTES'];
        
        logEntries.forEach(([logId, log]) => {
            const row = document.createElement('tr');
            properties.forEach(prop => {
                const cell = document.createElement('td');
                cell.textContent = log[prop] || "-";
                row.appendChild(cell);
            });
            tableBody.appendChild(row);
        });
    } else {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.setAttribute('colspan', '9');
        cell.textContent = 'No logs available for this order.';
        row.appendChild(cell);
        tableBody.appendChild(row);
    }
}

// ======================
// NEW JOB PAGE
// ======================

/**
 * Sets up the new job page functionality
 */
function setupNewJobPage() {
    console.log("New Job Loaded");
    const orderForm = document.getElementById('orderForm');
    const exportBtn = document.getElementById('exportBtn');

    if (!jsonData) {
        jsonData = JSON.parse(localStorage.getItem('orderData')) || { orders: {} };
    }

    orderForm?.addEventListener('submit', function(e) {
        e.preventDefault();
        const sop = document.getElementById('sopNumber').value.trim();
        const user = document.getElementById('user').value.trim();
        const writtenUp = document.getElementById('writtenUp').checked;
        const notes = document.getElementById('notesInput').value.trim();
        const rating = document.getElementById('ratingSelect').value.trim();

        if (!sop) {
            showMessage('Please enter a valid SOP');
            return;
        }

        const existingOrder = Object.values(jsonData.orders).find(
            order => order.SOP == sop && order.RATING === rating
        );

        if (!existingOrder) {
            createNewOrder(sop, rating, user, writtenUp, notes);
            orderForm.reset();
        } else {
            showMessage(`Order ${sop} (${rating}) already exists!`);
        }
    });

    exportBtn?.addEventListener('click', exportData);
}

// ======================
// INITIALIZATION
// ======================
document.addEventListener('DOMContentLoaded', () => {
    getData('./test.json', (data) => {
        jsonData = data;
        const path = window.location.pathname;
        
        if (path.includes('results.html')) {
            displayOrderDetails();
        } else if (path.includes('JobList.html')) {
            populateData();
            setupSearch();
        } else if (path.includes('Scan.html')) {
            initializeLocationHandlers();
            setupScanPage();
        } else if (path.includes('newJob.html')) {
            setupNewJobPage();
        }
    });
});