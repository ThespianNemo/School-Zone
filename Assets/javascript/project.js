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

  //shows the class which default is hidden on load
  $(".second-row").show();
  $(".third-row").show();
  //removes search box upon results loading
  $(".first-row").hide();

  //grabs zip code user entered
  var userZip = $("#postal-code").val().trim();
  console.log("zip code: " + userZip);
  // location.href = "results.html";

  //use geo code api to get state from zip code
  var getStateUrl = "http://maps.googleapis.com/maps/api/geocode/json?address=" + userZip + "&sensor=true";

  //ajax function to get corresponding state
  $.ajax({
    url: getStateUrl,
    method: "GET"
  }).then(function (response) {
    var stateResult = response.results[0].address_components[3].short_name;
    console.log("state: " + stateResult);

    var queryURL = "https://api.schooldigger.com/v1.1/schools?st=" + stateResult + "&zip=" + userZip + "&appID=3d9ff2e4&appKey=cf32743f4707e77808f66d4cbc553e80";

    console.log("schooldigger: " + queryURL);

    // ajax function to get search results for the given zip code 
    $.ajax({
      url: queryURL,
      method: 'GET',
    }).then(function (response) {
      var searchResults = response.schoolList
      console.log(searchResults);
      
      for (var i = 0; i < searchResults.length; i++) {
        
        var schoolName = searchResults[i].schoolName;
        
        var address = searchResults[i].address.street;
        
        var level = searchResults[i].schoolLevel;

        var stateRank = searchResults[i].rankHistory[0].rankStatewidePercentage;
       
        // Add school's data into the table
      $("#results-go-here > tbody").append("<tr><td>" + schoolName + "</td><td>" + address + "</td><td>" +
      level + "</td><td>" + stateRank + "%" + "</td></tr>");
    };
  });
  });
});

//event handler to reload page for user to start search over
$("#restart-search").on("click", function (event) {
  location.reload();
});


