const url = './test.json';
let jsonData;

function getData(url) {
  fetch(url)
    .then(response => response.json())
    .then(data => {
      jsonData = data;
      if(window.location.pathname.includes('results.html')) {
        displayOrderDetails();
      }else if(window.location.pathname.includes('JobList.html')) {          
        populateData();
      }else {
        console.log("OTHER PAGE");        
      }
    }).catch(e => console.error('Error loading data: ', e));
}

function populateData(){
  const tableBody = document.querySelector('#dataTable tbody');
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
      endTimeCell.textContent = log.STARTTIME;
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

// //--------------------------------------------------------//
// // LOCAL SAVE ONLY FOR TESTING AND DEMONSTRATING PURPOSES //
// //--------------------------------------------------------//
function saveData(){
  localStorage.setItem('orderData', JSON.stringify(jsonDataString));
  console.log('Data saved locally');  
}

if (document.getElementById(`orderForm`)) {
  document.getElementById(`orderForm`).addEventListener('submit', function(e) {
    e.preventDefault(e);
    const sop = document.getElementById(`sop`).value;
    const messageDiv = document.getElementById(`messageDiv`);
    if (!sop){
      messageDiv.textContent = "Please enter a valid SOP";
      return;
    }
    if (jsonData.orders[sop]){
      messageDiv.textContent = "SOP exists";
      return;
    }
    
    jsonData.orders[sop] = {
      SOP: parseInt(sop),
      'WRITTEN-UP': false,
      'ISSED-TO-FACTORY': false,
      'FACTORY-COPMLETE': false,
      'DISPATCH': null,
      'LOGS':{}
    };
    
    // saveData();
    console.log("NEW SOP created: ", jsonData.orders[sop]);
    messageDiv.textContent = `SOP ${sop} successfully created!`;
    
    
  })
}

function getCurrentTime(){
  const date = new Date();
  let hours = date.getHours();
  let mins = date.getMinutes();
  let results = "" + hours + mins;
  return results;
}

function getDuration(start, end){
  let startInt = parseInt(start);
  let endInt = parseInt(end);
  let result = endInt - startInt;
  if (result < 1) {return 1}
  return result;
}

let timerStarted = false;
let startTime = ""
let endTime = ""


document.getElementById('startTimer').addEventListener('click', function(e){
  timerStarted = true;
  startTime = getCurrentTime()
  document.getElementById('startTime').innerHTML = startTime;
})
document.getElementById('endTimer').addEventListener('click', function(e){
  if(!timerStarted){
    document.getElementById('endTime').innerHTML = "Start timer first";
    return
  }
  endTime = getCurrentTime();
  document.getElementById('endTime').innerHTML = endTime;
  
  document.getElementById('duration').innerHTML = getDuration(startTime, endTime);
})

document.addEventListener('DOMContentLoaded', () => {
      getData(url);
})