    // Initialize Firebase
  var config = {
    apiKey: "AIzaSyDJy6cU-2ytgAE8bEXNYyRghC2BQefJ3YM",
    authDomain: "schoolzone-f4eb7.firebaseapp.com",
    databaseURL: "https://schoolzone-f4eb7.firebaseio.com",
    projectId: "schoolzone-f4eb7",
    storageBucket: "",
    messagingSenderId: "420021802285"
  };
  firebase.initializeApp(config);

  var database = firebase.database();

  $("#submit-info").on("click", function (event) {

    event.preventDefault();

    var userState = $("#state").val().trim();
    console.log(userState);
    var userZip = $("#postal-code").val().trim();
    console.log(userZip);
  
    var queryURL = "https://api.schooldigger.com/v1.1/schools?st=" + userState + "&zip=" + userZip + "&appID=9015e2b3&appKey=98c6ebf7ffad8d35ee898e50e0f69eab";

    console.log(queryURL);

   

    //on click navigates to new page with results for the given search

    $.ajax({
        url: queryURL,
        method: "GET"
      })
    })
