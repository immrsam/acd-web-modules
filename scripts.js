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
    
    //SOP cell
    const sopCell = document.createElement('td');
    const sopLink = document.createElement('a');
    sopLink.href = `results.html?sop=${order.SOP}`;
    sopLink.textContent = order.SOP;
    sopCell.appendChild(sopLink);
    row.appendChild(sopCell);
    
    //written up cell
    const writtenUpCell = document.createElement('td');
    writtenUpCell.textContent = order['WRITTEN-UP'] ? 'Yes' : 'No';
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
      let last = Object.keys(order.LOGS).sort().pop();
      locationCell.textContent = order.LOGS[last].AREA;
    }
    row.appendChild(locationCell);

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
      //user cell
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


document.addEventListener('DOMContentLoaded', () => {
  getData('./test.json', (data) => {
    jsonData = data;
    if(window.location.pathname.includes('results.html')) {
      displayOrderDetails();
    }else if(window.location.pathname.includes('JobList.html')) {
      populateData();
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
          const area = document.getElementById('location').value.trim();
          const subArea = document.getElementById('sub-option').value.trim();
          const startTime = document.getElementById('startTimeInput').value.trim();
          const endTime = document.getElementById('endTimeInput').value.trim();           


          if (!sop) {
              showMessage('Please enter a valid SOP', 'error');
              return;
          }

          if (jsonData.orders[sop]) {
              showMessage(`Order ${sop} already exists`, 'warning');
              
              const now = new Date();
              const timestamp = 
              now.getFullYear().toString() + 
              String(now.getMonth() + 1).padStart(2, '0') + 
              String(now.getDate() + 1).padStart(2, '0') + 
              String(now.getHours() + 1).padStart(2, '0') + 
              String(now.getMinutes() + 1).padStart(2, '0');
              
              const newLog = {
                "USER":user,
                "AREA":subArea + ' - ' + area,
                "LINE":null,
                "STARTTIME":startTime,
                "ENDTIME":endTime,
                "DURATION":getDuration(startTime, endTime),
                "STATUS":"COMPLETE",
                "NOTES":""
              }

              console.log(timestamp);
              console.log(newLog);

              jsonData.orders[sop].LOGS[timestamp] = newLog;

              showMessage(`Order ${sop} updated successfully!`, 'success');
              localStorage.setItem('orderData', JSON.stringify(jsonData));
              orderForm.reset();
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

  function addNewLog(jsonData, sopNumber, user, area, subArea, notes = " "){
    const now = new Date();
    const timestamp = 
    now.getFullYear().toString() + 
    String(now.getMonth() + 1).padStart(2, '0') + 
    String(now.getDate() + 1).padStart(2, '0') + 
    String(now.getHours() + 1).padStart(2, '0') + 
    String(now.getMinutes() + 1).padStart(2, '0');
    
    const newLog = {
      "USER":user,
      "AREA":subArea + ' - ' + area,
      "LINE":null,
      "STARTTIME":1200,
      "ENDTIME":1400,
      "DURATION":120,
      "STATUS":"COMPLETE",
      "NOTES":notes
    }

    console.log(newLog);
    

    if(!jsonData.orders[sopNumber].LOGS){
      jsonData.orders[sopNumber].LOGS[timestamp] = newLog;

    }
    
    return newLog;
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

// -----------------
// Datalist populate
// -----------------

const locationOptions = {
    "OFFICE":["WRITTEN-UP", "ISSUED-FACTORY","FACTORY-COMPLETE"],
    "FIRE-DOORS":["BEAM-SAW","WALL-SAW","PANEL-SAW","COLD-PRESS","HOT-PRESS","SPINDLE-MOULDER","UPCUT-SAW","FRAMING","HAND-TOOLS"],
    "DET":["DET-MACHINE","HAND-TOOLS"],
    "FACTORY-10":["CNC", "EDGE-RUNNER","HAND-TOOLS", "UPCUT-SAW"],
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
    
    document.getElementById('duration').innerHTML = getDuration(startTime, endTime);
  })

  // File handeling
  
  // let targetFileHandle = null;
  // document.getElementById('fileInput').addEventListener('change', async (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   //Chrome and Edge only
  //   if ('showSaveFilePicker' in window) {
  //     try {
  //       console.log("showSaveFilePicker");
  //       targetFileHandle = await window.showSaveFilePicker({
  //         suggestedName: 'test.json',
  //         types: [{
  //           description: 'JSON Files',
  //           accept: { 'application/json': ['.json']}
  //         }]
  //       })
  //       await exportData(true);
  //     } catch(err){
  //       console.log("User canceled save");  
  //       console.error(err);
        
        
  //     }
  //   }
  // })

  // document.getElementById('overwriteBtn').addEventListener('click', () => {
  //   console.log("OVERWRITE BUTTON");
  //   document.getElementById('fileInput').click();
  // })

}

