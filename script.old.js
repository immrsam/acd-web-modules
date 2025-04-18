const url = './test.json';
let jsonData;

function getData(url, cb) {
  fetch(url)
      .then(response => response.json())
      .then(result => cb(result))
      .catch(error => console.error('Error loading data:', error));
}

function populateData(){
  const tableBody = document.querySelector('#dataTable tbody');
  
  if(!tableBody) return;

  tableBody.innerHTML = ''; // clear any existing rows

  for (const orderId in jsonData.orders){
    const order = jsonData.orders[orderId];
    
    const row = document.createElement('tr');

    // //lastdate up cell
    // const dateCell = document.createElement('td');
    // dateCell.textContent = order.DATE;
    // row.appendChild(dateCell);
    


    //SOP cell
    const sopCell = document.createElement('td');
    const sopLink = document.createElement('a');
    sopLink.href = `results.html?sop=${order.SOP}`;
    sopLink.textContent = order.SOP;
    sopCell.appendChild(sopLink);
    row.appendChild(sopCell);
    
    //written up cell
    const writtenUpCell = document.createElement('td');
    writtenUpCell.textContent = order['WRITTEN-UP'];
    row.appendChild(writtenUpCell);
    
    //factory issued cell
    const factoryIssuedCell = document.createElement('td');
    factoryIssuedCell.textContent = order['ISSUED-TO-FACTORY'] ? 'Yes' : 'No';
    row.appendChild(factoryIssuedCell);
    
    //factory issued cell
    const factoryCompleteCell = document.createElement('td');
    factoryCompleteCell.textContent = order['FACTORY-COMPLETE'] ? 'Yes' : 'No';
    row.appendChild(factoryCompleteCell);
    
    //Last location
    const locationCell = document.createElement('td');
    locationCell.textContent = "-";
    if (order.LOGS && Object.keys(order.LOGS).length > 0){
      let last = Object.keys(order.LOGS).sort().shift();
      locationCell.textContent = order.LOGS[last].AREA;
    }
    row.appendChild(locationCell);

    //Last date
    const dateCell = document.createElement('td');
    dateCell.textContent = "-";
    if (order.LOGS && Object.keys(order.LOGS).length > 0){
      let last = Object.keys(order.LOGS).sort().shift();
      
      if(order.LOGS[last].DATE){
        dateCell.textContent = order.LOGS[last].DATE;

      }
      
    }

    row.appendChild(dateCell);
    
    //dispatch cell
    const dispatchCell = document.createElement('td');
    dispatchCell.textContent = order.DISPATCH;
    row.appendChild(dispatchCell);

    tableBody.appendChild(row);
  }
}

function displayOrderDetails(){
  if(!window.location.pathname.includes('results.html')) return;
  
  const urlParams = new URLSearchParams(window.location.search);
  const sop = urlParams.get(`sop`);

  const order = jsonData.orders[sop]
  const sogContainer = document.getElementById('sop-number').textContent = `SOP: ${order.SOP}`;
  const tableBody = document.querySelector('#logTable tbody');
  tableBody.innerHTML = ''; // clear any existing rows
  
  if (order.LOGS && Object.keys(order.LOGS).length > 0)  {
    
    for(const logId in order.LOGS){
      const row = document.createElement('tr');
      const log = order.LOGS[logId];
      //date cell
      const dateCell = document.createElement('td');
      dateCell.textContent = log.DATE;
      row.appendChild(dateCell)
;      //user cell
      const userCell = document.createElement('td');
      userCell.textContent = log.USER;
      row.appendChild(userCell);
      //area cell
      const areaCell = document.createElement('td');
      areaCell.textContent = log.AREA;
      row.appendChild(areaCell);
      //line cell
      const lineCell = document.createElement('td');
      lineCell.textContent = log.LINE;
      row.appendChild(lineCell);
      //starttime cell
      const startTimeCell = document.createElement('td');
      startTimeCell.textContent = log.STARTTIME;
      row.appendChild(startTimeCell);
      //endtime cell
      const endTimeCell = document.createElement('td');
      endTimeCell.textContent = log.ENDTIME;
      row.appendChild(endTimeCell);
      //duration cell
      const durationCell = document.createElement('td');
      durationCell.textContent = log.DURATION;
      row.appendChild(durationCell);
      //status cell
      const statusCell = document.createElement('td');
      statusCell.textContent = log.STATUS;
      row.appendChild(statusCell);
      //notes cell
      const notesCell = document.createElement('td');
      notesCell.textContent = log.NOTES;
      row.appendChild(notesCell);

      tableBody.appendChild(row);
    }    
  }
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
      noResults.style.display = hasResults ? 'none' : 'block';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  getData('./test.json', (data) => {
    jsonData = data;
    if(window.location.pathname.includes('results.html')) {
      displayOrderDetails();
    }else if(window.location.pathname.includes('JobList.html')) {
      populateData();
      setupSearch();
    }else {
      console.log("OTHER PAGE");        
    }
  });
})

// ---------------------------------------------------------------------//
//                              SCAN PAGE SCRIPTS                       //
// ---------------------------------------------------------------------//

//--------------------------------------------------------//
// LOCAL SAVE ONLY FOR TESTING AND DEMONSTRATING PURPOSES //
//--------------------------------------------------------//
function startTime(){
  const startTime = document.getElementById('startTimeInput').innerHTML = getCurrentTime();
  console.log(getCurrentTime());
  
}
function endTime(){
  const endTime = document.getElementById('endTime').innerHTML = getCurrentTime();
}

if (window.location.pathname.includes('Scan.html')) {
  console.log("Scan loaded");
  
  const orderForm = document.getElementById('orderForm');
  const exportBtn = document.getElementById('exportBtn');
  const messageDiv = document.getElementById('messageDiv');

  // Load existing data if available
  if (!jsonData) {
      jsonData = JSON.parse(localStorage.getItem('orderData')) || { orders: {} };
      console.log(jsonData);      
  }

  // Order form handler
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
              // showMessage(`Order ${sop} already exists`);
              
              const now = new Date();
              const timestamp = 
              now.getFullYear().toString() + 
              String(now.getMonth() + 1).padStart(2, '0') + 
              String(now.getDate()).padStart(2, '0') + 
              String(now.getHours()).padStart(2, '0') + 
              String(now.getMinutes() ).padStart(2, '0');
              const date = now.getDate().toString() + '/' + String(now.getMonth() + 1) + '/' + String(now.getFullYear()) + ' ' + String(now.getHours()).padStart(2, '0') + ':' +
              String(now.getMinutes() ).padStart(2, '0');



              const newLog = {
                "DATE": date,
                "USER":user,
                "AREA":subArea + ' - ' + area,
                "LINE":lineSelect,
                "STARTTIME":startTime,
                "ENDTIME":endTime,
                "DURATION":getDuration(startTime, endTime),
                "STATUS":statusInput,
                "NOTES":notes
              }

              console.log(timestamp);
              console.log(newLog);

              jsonData.orders[sop].LOGS[timestamp] = newLog;

              showMessage(`Order ${sop} updated successfully!`);
              localStorage.setItem('orderData', JSON.stringify(jsonData));
              orderForm.reset();
              return;
          }

          showMessage(`Order ${sop} not in system`);

      });
  }
  // Export handler
if (exportBtn) {
  exportBtn.addEventListener('click', function() {
    console.log("EXPORT CLICK");
    
    const rawData = localStorage.getItem('orderData');
    const dataStr = JSON.stringify(JSON.parse(rawData), null, 2);
      if (!dataStr) {
          showMessage('No data found in localStorage');
          return;
      }
      
      try {
          // Optional: Validate it's valid JSON
          JSON.parse(dataStr);
          
          const blob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          
          const a = document.createElement('a');
          a.href = url;
          a.download = 'test.json';  // Changed filename to be more descriptive
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

  // Helper function
  function showMessage(text) {
      if (!messageDiv) return;
      messageDiv.textContent = text;
  }
}
// ----------------
// NEW JOB
// ----------------
if (window.location.pathname.includes('newJob.html')) {
  console.log("New Job Loaded");
  
  const orderForm = document.getElementById('orderForm');
  const exportBtn = document.getElementById('exportBtn');
  const messageDiv = document.getElementById('messageDiv');

  // Load existing data if available
  if (!jsonData) {
      jsonData = JSON.parse(localStorage.getItem('orderData')) || { orders: {} };
      console.log(jsonData);      
  }

  // Order form handler
  if (orderForm) {
    console.log("STARTED ORDERFORM");
    
      orderForm.addEventListener('submit', function(e) {
          e.preventDefault();
          const sop = document.getElementById('sopNumber').value.trim();
          const user = document.getElementById('user').value.trim();
          const writtenUp = document.getElementById('writtenUp').checked;
          const notes = document.getElementById('notesInput').value.trim();
          console.log(writtenUp);
          
          if (!sop) {
              showMessage('Please enter a valid SOP');
              return;
          }

          if (!jsonData.orders[sop]) {
              // showMessage(`Order ${sop} already exists`);
              
              const now = new Date();
              const timestamp = 
              now.getFullYear().toString() + 
              String(now.getMonth() + 1).padStart(2, '0') + 
              String(now.getDate() + 1).padStart(2, '0') + 
              String(now.getHours() + 1).padStart(2, '0') + 
              String(now.getMinutes() + 1).padStart(2, '0');
              const date = now.getDate().toString() + '/' + String(now.getMonth() + 1) + '/' + String(now.getFullYear()) + ' ' + String(now.getHours()).padStart(2, '0') + ':' +
              String(now.getMinutes() ).padStart(2, '0');

              // Create new order matching existing structure
              jsonData.orders[sop] = {
                  SOP: parseInt(sop),
                  'WRITTEN-UP': writtenUp ? "Yes" : "No",
                  'ISSUED-TO-FACTORY': false,
                  'FACTORY-COMPLETE': false,
                  'DISPATCH': null,
                  'LOGS': {}
              };

              const newLog = {
                "DATE":date,
                "USER":user,
                "AREA":"Office - " + (writtenUp ? "WRITEN-UP" : ""),
                "LINE":null,
                "STARTTIME":getCurrentTime(),
                "ENDTIME":getCurrentTime(),
                "DURATION":getDuration(startTime, endTime),
                "STATUS":"COMPLETE",
                "NOTES":notes
              }

              console.log(timestamp);
              console.log(date);
              console.log(newLog);
              console.log(jsonData);
              

              jsonData.orders[sop].LOGS[timestamp] = newLog;

              showMessage(`Order ${sop} updated successfully!`);
              localStorage.setItem('orderData', JSON.stringify(jsonData));
              orderForm.reset();
              return;
          }

        

          showMessage(`Order ${sop} already in system`);
          console.log(`Order ${sop} already in system`);
          
          // localStorage.setItem('orderData', JSON.stringify(jsonData));
          // orderForm.reset();
      });
  }

 // Export handler
 if (exportBtn) {
  exportBtn.addEventListener('click', function() {
    console.log("EXPORT CLICK");
    
    const rawData = localStorage.getItem('orderData');
    const dataStr = JSON.stringify(JSON.parse(rawData), null, 2);
      if (!dataStr) {
          showMessage('No data found in localStorage');
          return;
      }
      
      try {
          // Optional: Validate it's valid JSON
          JSON.parse(dataStr);
          
          const blob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          
          const a = document.createElement('a');
          a.href = url;
          a.download = 'test.json';  // Changed filename to be more descriptive
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

  // Helper function
  function showMessage(text) {
      if (!messageDiv) return;
      messageDiv.textContent = text;
  }
}


// -----------------
// Datalist populate
// -----------------

const locationOptions = {
    "OFFICE":["WRITTEN-UP", "ISSUED-FACTORY","FACTORY-COMPLETE"],
    "FIRE-DOORS":["BEAM-SAW","WALL-SAW","PANEL-SAW","COLD-PRESS","HOT-PRESS","SPINDLE-MOULDER","UPCUT-SAW","FRAMING","HAND-TOOLS"],
    "DET":["DET-MACHINE","HAND-TOOLS"],
    "FACTORY-8":["CNC", "EDGE-RUNNER","HAND-TOOLS", "UPCUT-SAW"],
    "NON-RATED":["BEAM-SAW","WALL-SAW","PANEL-SAW","COLD-PRESS","UPCUT-SAW","FRAMING","HAND-TOOLS"],
    "DESPATCH":["WRAPPED","SENT"]
  }

function updateOptions() {
  const locationInput = document.getElementById('location');
  const subOptionDatalist = document.getElementById('sub-options');
  
  if(!locationInput){
    console.error('location missing');
    return
  }
  
  if(!subOptionDatalist){
    console.error('sub missing');
    return
  }
   
  subOptionDatalist.innerHTML = '';
  
  const selectedLocation = locationInput.value;
  
  if(locationOptions[selectedLocation]){
    locationOptions[selectedLocation].forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option;
      optionElement.innerHTML = option;
      subOptionDatalist.appendChild(optionElement);      
    });
  }  
}


// -----------------
// Timer
// -----------------
function getCurrentTime(){
  const now = new Date();
  const timestamp = 
    String(now.getHours()).padStart(2, '0') + 
    String(now.getMinutes()).padStart(2, '0');
  return timestamp;
}

function getDuration(start, end){
  let startInt = parseInt(start);
  let endInt = parseInt(end);
  let result = endInt - startInt;
  if (result < 1) {return 1}
  return result;
}

// Chack if page is on Scan.html
if(window.location.pathname.includes('Scan.html')) {
  // BASIC TIMER 
  let timerStarted = false;
  let startTime = ""
  let endTime = ""
  
  document.getElementById('startTimer').addEventListener('click', function(e){
    timerStarted = true;
    startTime = getCurrentTime()
    document.getElementById('startTimeInput').value = startTime;
  })
  
  document.getElementById('endTimer').addEventListener('click', function(e){
    if(!timerStarted){
      document.getElementById('endTime').innerHTML = "Start timer first";
      return
    }
    endTime = getCurrentTime();
    document.getElementById('endTimeInput').value = endTime;
    
    // document.getElementById('duration').innerHTML = getDuration(startTime, endTime);
  })



}

