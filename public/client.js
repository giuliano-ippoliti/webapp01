// client-side js
// run by the browser each time your view template referencing it is loaded

console.log('client.js loading...');

// Start with an empty array
let dreams = [];

// define variables that reference elements on our page

// unordered (bulleted) list
const dreamsList = document.getElementById('dreams');

// form (including input text field and submit button)
const dreamsForm = document.forms[0];

// input text field
const dreamInput = dreamsForm.elements['dream'];

// a helper function to call when our request for dreams is done (callback)
const getDreamsListener = function() {
  // parse our response (from /getDreams) to convert to JSON

  // this: XMLHttpRequest to /getDreams
  // the response property is text : [{"dream":"Find and count some sheep"}, ... ]
  // dreams is an array of objects : [0] -> { dream: "Find and count some sheep" }, ...
  dreams = JSON.parse(this.response);

  // iterate through every dream and add it to our page
  dreams.forEach( (row) => {
    appendNewDream(row.dream);
  });
}

// request the dreams from our app's sqlite database

// Use XMLHttpRequest (XHR) objects to interact with servers
const dreamRequest = new XMLHttpRequest();

// XMLHttpRequest.onload = callback;
// callback is the function to be executed when the request completes successfully.
// The value of this (i.e. the context) is the same XMLHttpRequest this callback is related to.
dreamRequest.onload = getDreamsListener;

// XMLHttpRequest.open(method, url[, async[, user[, password]]])
dreamRequest.open('get', '/getDreams');

// send the request to the server.
// If the request is asynchronous (which is the default), this method returns as soon as the request is sent
// and the result is delivered using events (cf: onload)
dreamRequest.send();

// OWASP : Except for alphanumeric characters, escape all characters with ASCII values less than 256 with the &#xHH; format (or a named entity if available) to prevent switching out of the attribute.
const OWASPescape = (str) => {
  return str.replace(/[%*+,-/;<=>^|]/g, '-');
} 

// a helper function that creates a list item for a given dream
const appendNewDream = (dream) => {
  const newListItem = document.createElement('li');

  // beware of XSS!
  // https://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet
console.log(dream);
  var sanitizedDream = OWASPescape(dream);
console.log(sanitizedDream);
  newListItem.innerHTML = sanitizedDream;

  dreamsList.appendChild(newListItem);
}

// function that inserts dream into the sqlite database
const insertDream = (dream) => {
  const http = new XMLHttpRequest();
  const url = '/insertDream';

  http.open("POST", url);
  http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  const dreamToInsert = {};
  dreamToInsert.dream = dream;

  console.log(dreamToInsert);  

  http.send(JSON.stringify(dreamToInsert));
}

// listen for the form to be submitted and add a new dream when it is
dreamsForm.onsubmit = function(event) {
  // stop our form submission from refreshing the page
  event.preventDefault();

  // get dream value and add it to the list
  dreams.push(dreamInput.value);
  appendNewDream(dreamInput.value);

  // call API to insert dream into the database
  insertDream(dreamInput.value);

  // reset form 
  dreamInput.value = '';
  dreamInput.focus();
};

