const display = document.querySelector('#display');

//web app's Firebase configuration
  let firebaseConfig = {
    apiKey: "AIzaSyDu2eLLFghcX_1I_ZIMxUbGyAvE1NyoNp8",
    authDomain: "book-library-serverside.firebaseapp.com",
    databaseURL: "https://book-library-serverside.firebaseio.com",
    projectId: "book-library-serverside",
    storageBucket: "book-library-serverside.appspot.com",
    messagingSenderId: "144062401901",
    appId: "1:144062401901:web:ee3cfc2b0d42d65e9a1e64",
    measurementId: "G-FRFCCSCR89"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();
  console.log(firebase);




// array of objects that act as a library
let myLibrary=[];

let database= firebase.database();//stores firebase database
let ref= database.ref('Library')// creates and refers to 'library' tree 
removeAllChildNodes(display);
listBooks();// displays books cl


// object that stores the book info
function book (title, author,pages,read)
{
    this.title=title,
    this.author=author,
    this.pages=pages,
    this.readStatus=read
}

// creates a book and store it in the array
function createBook()
{
    let bookData=addBook();// book information returned as an array

    let bookObject =new book(bookData[0],bookData[1],bookData[2],bookData[3]);// stores book data in respective locations

    ref.push(bookObject); // **************pushes book to Database online

removeAllChildNodes(display);
listBooks();   
}

//pulls down books from database to display on screen.
function listBooks()
{
    removeAllChildNodes(display)
     ref.on('value',receiveData, errorData); //calls on database to send values. 
}
   

// accepts the respective values for a new book
function addBook()
{
    let title,author,pages,readStatus;

    //stores the values from the form in respective variables
    title= document.getElementsByName("title")[0].value;
    author=document.getElementsByName("author")[0].value;
    pages=  document.getElementsByName("pages")[0].value;


    // gets read status of book if none is selected, sets the default to not read
    if(document.getElementById("read").checked)
    {
    readStatus='Read';
    }

    else{
    readStatus='Not Read';
    }
    return [title,author,pages,readStatus] 
}

//used to clear display on client side
function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}


// ************************************************************************************************************
// ************************************************************************************************************

// ************************************************************************************************************
// ************************************************************************************************************


// this is a big function that will be refactored in the next edit
// it receives the data from the Database, displays and manipulates it. 
function receiveData(allData)
{
 
    let library=allData.val();

    //if the library is empty, displays the appropriate message  else Displays the book client side. 
    if (library==null)
    {
        
        removeAllChildNodes(display);
        let empty=document.createElement('div');
        empty.textContent='The library is empty. Please add a book';
        empty.style.fontSize='2.5em';
        display.appendChild(empty);
    }

    else {
        let keysList=Object.keys(library); // returns an array of books in Library

        // For each element display its data client side.

        keysList.forEach(e=>{ 

            //create HTML elements to display book data
            let title=document.createElement('p');
            let author=document.createElement('p');
            let pages=document.createElement('p');
            let readStatus=document.createElement('p');
            let linebreak = document.createElement("br");
            let button=document.createElement('button');
            let buttonStatus=document.createElement('button');
            let card= document.createElement("div");

            //display the data to the screen
            title.textContent=`${library[e].title}` ;
            card.appendChild(title);
            card.appendChild(linebreak);
            

            
            author.textContent=`Author: ${library[e].author}` ;
            card.appendChild(author);
            card.appendChild(linebreak);

            
            pages.textContent=`Pages: ${library[e].pages}` 
            card.appendChild(pages);
            card.appendChild(linebreak);
            

        
            readStatus.textContent=`${library[e].readStatus}` 
            readStatus.setAttribute('id',`para${e}`);
            card.appendChild(readStatus);
            card.appendChild(linebreak);

            button.textContent='remove';
            button.setAttribute('id',`${e}`);
            button.setAttribute('name','removeButton');
            card.appendChild(linebreak);        
            card.appendChild(button);

            buttonStatus.textContent='Read/Unread';
            buttonStatus.setAttribute('id',`status${e}`);
            card.appendChild(buttonStatus);

            card.setAttribute('class','cards');
            card.setAttribute( 'id',`card${e}`);
            display.appendChild(card);

            document.getElementById(`${e}`).addEventListener("click", removeBook);//gets ID of book to remove
            document.getElementById(`status${e}`).addEventListener("click", toggleRead); //gets ID of book to change status for

        })


        // changes the status of the 'Read' attribute
       function toggleRead(e)
        {   
            let str=`${e.target.id}`;// stringify id.
            let strSliced=str.slice(6); //slices the 'status' section from the id to made it useful for indexing. Returns only the key.

            
            if(library[strSliced].readStatus=='Read')
            { 
                library[strSliced].readStatus='Not Read';// changes the 'read' attribute 
                updateReadStatus(library[strSliced].readStatus,library[strSliced].title,
                    library[strSliced].pages,library[strSliced].author,strSliced);// updates record in the database
                removeAllChildNodes(display);
                listBooks();
              
            }
            else{
                library[strSliced].readStatus='Read';// changes the 'read' attribute 
                updateReadStatus(library[strSliced].readStatus,library[strSliced].title,
                    library[strSliced].pages,library[strSliced].author,strSliced);// updates record in the database
                removeAllChildNodes(display);
                listBooks();
            }
        }

        //takes the value of updated record and updates the data base. 
        function updateReadStatus(readStatus1,title1,pages1,author1,id)
            {
                //updates record utilising a call back function.
                firebase.database().ref('Library/'+ id).set({
                    author:author1,
                    pages:pages1,
                    readStatus:readStatus1,
                    title:title1
                }, function(error) {
                    if (error) {
                      Console.log(`error!!`);
                    } else {
                      console.log(`write successfully`);
                    }
                  });
            }
        
        // Removes book from Database and Client 
        function removeBook(e)
            {
            let kIndex;

            // matches the ID of the 'remove' button that was clicked with its corresponding index in keysList
            keysList.forEach((element,index) =>{
                if(element==e.target.id)
                {kIndex=index};
            })

                ref.child(keysList[kIndex]).remove();// removes selected book from Database.                
            removeAllChildNodes(display);
            listBooks(); // redisplays books available. 
            }




    }
}

//used to notify user when no data is received from Server. 
function errorData(err)
{
removeAllChildNodes(display);
let empty=document.createElement('div');
empty.textContent='No data received from database';
empty.style.fontSize='2.5em';
display.appendChild(empty);
}

