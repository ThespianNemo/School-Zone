<<<<<<< HEAD
var zipcode = $(this).attr("postal-code"); 
console.log(zipcode);

var queryURL = "https://api.schooldigger.com/v1.1/schools?st=il&level=Elementary&zip=" + zipcode + "&nearLatitude=20&boundaryAddress=1700%20Hinman%20Ave&perPage=20&sortBy=rank&appID=9015e2b3&appKey=98c6ebf7ffad8d35ee898e50e0f69eab";
 
// Creating an AJAX call for the specific movie genre button being clicked
$.ajax({
    url: queryURL,
    method: "GET"
}).then(function(response) {
    console.log(response);
});
=======
  
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

    $.ajax({
        url: queryURL,
        method: "GET"
      })
    })
>>>>>>> 40288ca0f700724a2f1936f37d1d18f8bb889e79
