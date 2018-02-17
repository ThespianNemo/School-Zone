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

//when user clicks "go" run this function
$("#submit-info").on("click", function (event) {

  event.preventDefault();

  //grabs zip code user entered
  var userZip = $("#postal-code").val().trim();
  console.log("zip code: " + userZip);


//use geo code api to get state from zip code
  var getStateUrl = "http://maps.googleapis.com/maps/api/geocode/json?address=" + userZip + "&sensor=true";

//ajax function to get 
  $.ajax({
    url: getStateUrl,
    method: "GET"
  }).then(function (response) {
    var result = response.results[0].address_components[3].short_name;
    console.log("state: " + result);

    var queryURL = "https://api.schooldigger.com/v1.1/schools?st=" + result + "&zip=" + userZip + "&appID=9015e2b3&appKey=98c6ebf7ffad8d35ee898e50e0f69eab";

    console.log("schooldigger: " + queryURL);

  })
});


