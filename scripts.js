// alert("Page loaded");
console.log("loaded");

// fetch("test.json")
//   .then(response => response.json())
//   .then(json => console.log(json));

function getData(url, cb) {
  fetch(url)
    .then(response => response.json())
    .then(result => cb(result));
}

getData("./test.json", (data) => console.log({ data }))