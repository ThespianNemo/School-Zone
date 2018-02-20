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

  //removes search box upon results loading
  $(".first-row").hide();
  //shows the class which default is hidden on load
  $(".second-row").show();
  $(".third-row").show();


  //grabs zip code user entered
  var userZip = $("#postal-code").val().trim();

  //use geo code api to get state from zip code
  var getStateUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=" + userZip + "&key=AIzaSyCJebjxnEgjtzw7YloxNhus_LU08cAmDTA";

  //ajax function to get corresponding state
  $.ajax({
    url: getStateUrl,
    method: "GET"
  }).then(function (response) {
    var stateResult = "";

    //check for State info in object
    if (response.results[0].address_components[2].types[0] === "administrative_area_level_1") {
      stateResult = response.results[0].address_components[2].short_name;
    } else if (response.results[0].address_components[3].types[0] === "administrative_area_level_1") {
      stateResult = response.results[0].address_components[3].short_name;
    } else if (response.results[0].address_components[4].types[0] === "administrative_area_level_1") {
      stateResult = response.results[0].address_components[4].short_name;
    };

    var queryURL = "https://api.schooldigger.com/v1.1/schools?st=" + stateResult + "&zip=" + userZip + "&appID=3d9ff2e4&appKey=cf32743f4707e77808f66d4cbc553e80";

    // ajax function to get search results for the given zip code 
    $.ajax({
      url: queryURL,
      method: 'GET',
    }).then(function (response) {
      var searchResults = response.schoolList;
      console.log(searchResults[2]);

      for (var i = 0; i < searchResults.length; i++) {

        var schoolName = searchResults[i].schoolName;
        var address = searchResults[i].address.street;
        var level = searchResults[i].schoolLevel;
        var stateRank = "";

        if (searchResults[i].rankHistory === null) {
          stateRank = "N/A"
        } else {
          stateRank = searchResults[i].rankHistory[0].rankStatewidePercentage + " %";
        }

        //variables that will be needed for expanded results
        var charter = searchResults[i].isCharterSchool;
        var magnet = searchResults[i].isMagnetSchool;
        var isPrivate = searchResults[i].isPrivate;
        var avgScore = "";

        if (searchResults[i].rankHistory === null) {
          avgScore = "N/A"
        } else {
          avgScore = searchResults[i].rankHistory[0].averageStandardScore;
        };

        var studentSize = searchResults[i].schoolYearlyDetails[0].numberOfStudents;
        var ratio = searchResults[i].schoolYearlyDetails[0].pupilTeacherRatio;
  
        //and unique ID to each item in results
        var ID = i + 1;
        var table = $("<tr>");
        table.attr('id', ID);
        //add class to each row
        table.addClass("result");

        //add school's data into the table
        var resultsList = ("<td>" + schoolName + "<td>" + address + "</td><td>" +
          level + "</td><td>" + stateRank + "</td>");

        table.append(resultsList);

        // Add table to the HTML
        $("#results-go-here > tbody").append(table);

        //Check to see which crystal the user chose and add that crystal's value to the user's total score
        $(".result").on("click", function () {
          var choice = ($(this).attr("id"));
          var resultChoice = "";

          $(".fourth-row").show();
          $(".fifth-row").show();
          $(".second-row").hide();
          $(".third-row").hide();

          if (choice === "1") {
            resultChoice = 0
          } else if (choice === "2") {
            resultChoice = 1
          } else if (choice === "3") {
            resultChoice = 2
          } else if (choice === "4") {
            resultChoice = 3
          } else if (choice === "5") {
            resultChoice = 4
          } else if (choice === "6") {
            resultChoice = 5
          } else if (choice === "7") {
            resultChoice = 6
          } else if (choice === "8") {
            resultChoice = 7
          } else if (choice === "9") {
            resultChoice = 8
          } else if (choice === "10") {
            resultChoice = 9
          } else if (choice === "11") {
            resultChoice = 10
          }

          displayExtended();

          function displayExtended (){

            if (searchResults[resultChoice].rankHistory === null) {
              avgScore = "N/A"
            } else {
              avgScore = searchResults[resultChoice].rankHistory[0].averageStandardScore;
            };

            if (searchResults[resultChoice].rankHistory === null) {
              stateRank = "N/A"
            } else {
              stateRank = searchResults[resultChoice].rankHistory[0].rankStatewidePercentage + " %";
            }

            $("#school-name").html("School Name: " + searchResults[resultChoice].schoolName);
            $("#address").html("Address: " + searchResults[resultChoice].address.street);
            $("#level").html("Level: " + searchResults[resultChoice].schoolLevel);
            $("#state-rank").html("State Rank: " + stateRank);
            $("#charter").html("Charter?: " + searchResults[resultChoice].isCharterSchool);
            $("#magnet").html("Magnet?: " + searchResults[resultChoice].isMagnetSchool);
            $("#private").html("Private?: " + searchResults[resultChoice].isPrivate);
            $("#avg-score").html("Average Score: " + avgScore);
            $("#student-size").html("Student Population: " + searchResults[resultChoice].schoolYearlyDetails[0].numberOfStudents);
            $("#ratio").html("Student to Teacher Ratio: " + searchResults[resultChoice].schoolYearlyDetails[0].pupilTeacherRatio);
          };
        });
      };
    });
  });
});


//event handler to reload page for user to start search over
$("#restart-search").on("click", function (event) {
  location.reload();
});

$("#start-over").on("click", function (event) {
  location.reload();
});

$("#go-back").on("click", function (event) {

});

//enter/return key to trigger onclick function
$("#postal-code").keypress(function (e) {
  if (e.which === 13) {
    $("#submit-info").click();
  }
})



