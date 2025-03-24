
let jsonData;

function getData(url) {
  fetch(url)
    .then(response => response.json())
    .then(data => {
      jsonData = data;
      populateData();
    });
}

function populateData(){
  const tableBody = document.querySelector('#dataTable tbody');
  tableBody.innerHTML = ''; // clear any existing rows

  for (const orderId in jsonData.orders){
    const order = jsonData.orders[orderId];
    
    const row = document.createElement('tr');
    
    //SOP cell
    const sopCell = document.createElement('td');
    sopCell.textContent = order.SOP;
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
    const dispatchCell = document.createElement('td');
    dispatchCell.textContent = order.DISPATCH;
    row.appendChild(dispatchCell);

    tableBody.appendChild(row);
  }
}

getData("./test.json");