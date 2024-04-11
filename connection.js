/**
 * This function will query the CS4640 server for a new set of categories.
 *
 * It makes use of AJAX and Promises to await the result.  We won't discuss
 * promises in detail, so you're welcome to review this code for more
 * details.  However, essentially we need the browser to send an AJAX query
 * to our API and then wait for a reply.  If it just waits, then the browser
 * tab will appear to be frozen briefly while the HTTP request is taking place.
 * Therefore, we send the request with a Promise that awaits the results.  When
 * the response comes back from the server, the promise will return the result
 * to our getRandomCategories() function and that will call your function.  This happens
 * asynchronously, so you should treat your function like you would an event
 * handler.
 */
function queryCategories() {
    return new Promise( resolve => {
            // instantiate the object
            var ajax = new XMLHttpRequest();
            // open the request
            ajax.open("GET", "https://cs4640.cs.virginia.edu/homework/connections.php", true);
            // ask for a specific response
            ajax.responseType = "json";
            // send the request
            ajax.send(null);
            
            // What happens if the load succeeds
            ajax.addEventListener("load", function() {
                // Return the word as the fulfillment of the promise 
                if (this.status == 200) { // worked 
                    resolve(this.response);
                } else {
                    console.log("When trying to get a new set of categories, the server returned an HTTP error code.");
                }
            });
            
            // What happens on error
            ajax.addEventListener("error", function() {
                console.log("When trying to get a new set of categories, the connection to the server failed.");
            });
    });
}

/**
 * This is the function you should call to request a new word.
 * It takes one parameter: a callback function.  The function
 * passed in (i.e., a function you write) should take one
 * parameter (the new categories provided by the server) and handle the
 * setup of your new game.  For example, if you write a function 
 * named "setUpNewGame(newCategories)", then in your event handler for a new
 * game, you should call this function as:
 *     getRandomCategories(setUpNewGame);
 * Our getRandomCategories function will wait for the server to provide 
 * a new set of categories, and then it will call **your** function, passing in 
 * the categories as an object, so that your function can continue setting up 
 * the new game.
 */
async function getRandomCategories(callback) {
    var newCategories = await queryCategories();
    callback(newCategories);
}

       
var selectedContents = [];
function colour(td){
    if (td.classList.contains('selected')) {
        td.classList.remove('selected');
        var index = selectedContents.indexOf(td.textContent);
        if (index !== -1) {
            selectedContents.splice(index, 1);
        }
    } else {
        td.classList.add('selected');
        selectedContents.push(td.textContent);
    }
    var cellText = td.textContent;
    document.getElementById("selected-guess").innerText = "Selected Content: " +  selectedContents.join(', ');
    document.getElementById("guesses").value = JSON.stringify(selectedContents);

}
        
function submitGuess() {
    // Logic to check if guess is correct
    // Update game statistics and prior guesses display accordingly
    
    
}
function generateRandomTable(categories) {
  // Assuming categories is an array of category objects with each object having a 'name' and 'words' property
  //sample
  const tbl = document.getElementById('table');
    for (let i = 0; i < 3; i++) {
        const tr = tbl.insertRow();
        for (let j = 0; j < 2; j++) {
          if (i === 2 && j === 1) {
            break;
          } else {
            const td = tr.insertCell();
            td.appendChild(document.createTextNode(`Cell I${i}/J${j}`));
            td.style.border = '1px solid black';
            if (i === 1 && j === 1) {
              td.setAttribute('rowSpan', '2');
            }
          }
        }
      }
      body.appendChild(tbl);
}