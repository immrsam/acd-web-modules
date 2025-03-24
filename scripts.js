// alert("Page loaded");
console.log("loaded");

fetch("test.json")
  .then(response => response.json())
  .then(json => console.log(json));