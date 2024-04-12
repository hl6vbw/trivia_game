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
// function queryCategories() {
//     return new Promise( resolve => {
//             // instantiate the object
//             var ajax = new XMLHttpRequest();
//             // open the request
//             //ajax.open("GET", "https://cs4640.cs.virginia.edu/homework/connections.php", true);
//             //ajax.open("GET", "/data.json", true);
//             // ask for a specific response
//             ajax.responseType = "json";
//             // send the request
//             ajax.send(null);
            
//             // What happens if the load succeeds
//             ajax.addEventListener("load", function() {
//                 // Return the word as the fulfillment of the promise 
//                 if (this.status == 200) { // worked 
//                     resolve(this.response);
//                 } else {
//                     console.log("When trying to get a new set of categories, the server returned an HTTP error code.");
//                 }
//             });
            
//             // What happens on error
//             ajax.addEventListener("error", function() {
//                 console.log("When trying to get a new set of categories, the connection to the server failed.");
//             });
//     });
// }

function queryCategories() {
    return new Promise(resolve => {
        fetch('data.json') 
            .then(response => {
                if (!response.ok) {
                    throw new Error('error');
                }
                return response.json();
            })
            .then(data => resolve(data))
            .catch(error => console.error('Error while fetching categories:', error));
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

document.addEventListener('DOMContentLoaded', function() {

    const savedCategories = localStorage.getItem('triviaCategories');
    
    
    if (savedCategories) {
        setUpNewGame(JSON.parse(savedCategories));
    } else {
        newGame();
    }
    showPrevGuesses();
    showGuess();
});

function newGame() {
    localStorage.removeItem('triviaCategories');
    localStorage.removeItem('previousGuess');
    localStorage.removeItem('guess');
    showGuess();
    var list = document.getElementById("previous-guesses");
    list.innerHTML = '';
    var guess = localStorage.getItem('guess');
    var numgames = localStorage.getItem('numgames');
    getRandomCategories(setUpNewGame);
}

// function setUpNewGame(categories) {
//     const table = document.getElementById('table');
//     table.innerHTML = ''; 
//     let htmlContent = '<tbody>';

    
//     categories.categories.forEach((category, index) => {
//         htmlContent += '<tr>'; 
//         category.words.forEach(word => {
//             htmlContent += `<td onclick="selectWord(this)">${word}</td>`;
//         });
//         htmlContent += '</tr>'; 
//     });

//     htmlContent += '</tbody>';
//     table.innerHTML = htmlContent;
//     localStorage.setItem('triviaCategories', JSON.stringify(categories));

// }

function setUpNewGame(data) {
    const categories = data.categories;
    const table = document.getElementById('table');
    table.innerHTML = ''; 
    let htmlContent = '<tbody>';

    categories.forEach((category, index) => {
        htmlContent += '<tr>'; 
        category.words.forEach(word => {
            htmlContent += `<td class="red-line" onclick="selectWord(this)">${word}</td>`;
        });
        htmlContent += '</tr>'; 
    });

    htmlContent += '</tbody>';
    table.innerHTML = htmlContent;
    localStorage.setItem('triviaCategories', JSON.stringify(data));
}

function displaytable(shuffledarray) {
    const table = document.getElementById('table');
    table.innerHTML = ''; 
    let htmlContent = '<tbody>';
    var ind = 0;

    // Removed the automatic shuffling here
    for (let i = 0; i < 4; i++) {
        htmlContent += '<tr>';
        for (let j = 0; j < 4; j++) {
            htmlContent += `<td class="red-line" onclick="selectWord(this)">${shuffledarray[ind]}</td>`;
            ind += 1;
        }
        htmlContent += '</tr>'; 
    }
    htmlContent += '</tbody>';
    
    table.innerHTML = htmlContent;
    localStorage.setItem('shuffledarray', JSON.stringify(shuffledarray));
}

var selectedContents = [];

function selectWord(td) {
    if (td.classList.contains('selected')) {
        td.classList.remove('selected');
        var index = selectedContents.indexOf(td.textContent);
        if (index !== -1) {
            selectedContents.splice(index, 1);
        }
    } else {
        if (selectedContents.length < 4) {
            td.classList.add('selected');
            selectedContents.push(td.textContent);
        } else {
            showMessage('You can select only up to four words.');
        }
    }

    // Update the displayed text of selected contents
    document.getElementById("selected-guess").innerText = "Selected Content: " +  selectedContents.join(', ');
}


// function updateSelectedGuess() {
//     const selectedWords = document.querySelectorAll('.selected');
//     const selectedGuess = document.getElementById('selected-guess');
//     let content = 'Selected Content: ';
//     selectedWords.forEach(word => {
//         content += word.textContent + ', ';
//     });
//     content = content.replace(/, $/, '');
// }
        
function submitGuess() {
    var categories = JSON.parse(localStorage.getItem('triviaCategories')).categories;
    var correctCounts = {};
    var message = document.getElementById("message");
    var strarray = selectedContents.join(" ");

    updatepreviousGuess(strarray);

    categories.forEach(function(category) {
        correctCounts[category.category] = 0;
        category.words.forEach(word => {
            if (selectedContents.includes(word)) {
                correctCounts[category.category] += 1;
            }
        });
    });

    let maxCount = Math.max(...Object.values(correctCounts));
    let maxCategory = Object.keys(correctCounts).find(key => correctCounts[key] === maxCount);

    incrementGuess();

    if (maxCount <= 1) {
        message.innerHTML = 'None of your choices were in the same category';
    } else if (maxCount < 4) {
        message.innerHTML = maxCount.toString() + ' of your choices are in the same category';
    } else if (maxCount == 4) {
        message.innerHTML = 'Well done! Removing correct selections...';
        categories = categories.map(category => {
            if (category.category === maxCategory) {
                return { ...category, words: category.words.filter(word => !selectedContents.includes(word)) };
            }
            return category;
        }).filter(category => category.words.length > 0);

        localStorage.setItem('triviaCategories', JSON.stringify({ categories: categories }));
        setUpNewGame({ categories: categories });
    }

    resetSelections(); 
}

function resetSelections() {
    selectedContents = []; 
    document.querySelectorAll('.selected').forEach(td => {
        td.classList.remove('selected'); 
    });
    document.getElementById("selected-guess").innerText = "Selected Content: ";
}


    

    
  // selectedContents.forEach(function(item){
  //   var td = findTableCell(table, item);
  //   if (td) {
  //       colour(td);
  //   }
  // })
  // selectedContents = [];
    


function incrementGuess(){
  var guess = localStorage.getItem('guess');
  var guessnum = parseInt(guess);
  if (isNaN(guessnum)) {
    guessnum = 0;
  }
  var incrementedGuess = guessnum + 1;
  localStorage.setItem('guess', incrementedGuess);
  showGuess();
}

function showGuess(){
    var guess = localStorage.getItem('guess');
    const showguess = document.getElementById("guess-count");
    if(guess){
        showguess.textContent = guess;
    }else{
        showguess.textContent = '0';
    }
    
}

function updatepreviousGuess(strarray){
    var previousGuess = localStorage.getItem('previousGuess');
    if (previousGuess) {
        previousGuess += "|" + strarray;
    } else {
        previousGuess = strarray;
    }

    // Store the updated value back in localStorage
    localStorage.setItem('previousGuess', previousGuess);

    showPrevGuesses();

}
function showPrevGuesses() {
    var previousGuess = localStorage.getItem('previousGuess');
    var list = document.getElementById("previous-guesses");
    list.innerHTML = ''; 
    var guesses = previousGuess.split("|");

    // Loop through the array of guesses and add each one as a list item
    guesses.forEach(function(guess) {
        var newitem = document.createElement("li");
        newitem.textContent = guess;
        list.appendChild(newitem);
    });
}
function shuffle(){

    selectedGuess.textContent = content;
}


function clearHistory() {
    localStorage.removeItem('guess'); 
    localStorage.removeItem('previousGuess'); 


    document.getElementById('guess-count').textContent = '0'; 
    document.getElementById('previous-guesses').innerHTML = '';
    
    // Display a message to the user indicating the history has been cleared
    showMessage('Game history cleared.');
}

function showMessage(message) {
    const messageDiv = document.getElementById("message");
    messageDiv.textContent = message;
}




function showMessage(message) {
    const messageDiv = document.getElementById("message");
    messageDiv.textContent = message;
}


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        // Generate a random index from 0 to i
        let j = Math.floor(Math.random() * (i + 1)); 
        // Swap elements array[i] and array[j]
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function shuffle() {
    var randomarray = [];
    const categories = JSON.parse(localStorage.getItem('triviaCategories'));
    // if (categories) {
    //     categories.categories.forEach(category => {
            
    //         shuffleArray(category.words); 
    //     });
    //     setUpNewGame(categories); 
    // }
    if (categories) {
        categories.categories.forEach(category => {
            category.words.forEach(function(word){
                randomarray.push(word);
            })
            
            
        });
        shuffleArray(randomarray); 
        displaytable(randomarray);
        // setUpNewGame(categories); 
    }
}
