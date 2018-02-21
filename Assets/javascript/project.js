
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

$("#map").hide();

function initMap() {
  var uluru = { lat: 41.8781, lng: -87.6298 };
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 8,
    center: uluru
  });
  var marker = new google.maps.Marker({
    position: uluru,
    map: map
  });
}
$(window).on("load", function () {
  $("#submit-info").on("click", function (event) {
    event.preventDefault();


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

        //removes search box upon results loading
        $(".first-row").hide();
        //shows the class which default is hidden on load
        $("#map").show();
        $(".second-row").show();
        $(".third-row").show();

        var searchResults = response.schoolList;

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

          //and unique ID to each item in results
          var ID = i;
          var table = $("<tr>");
          table.attr('id', ID);
          
          table.addClass("result");

          //add school's data into the table
          var resultsList = ("<td>" + schoolName + "<td>" + address + "</td><td>" +
            level + "</td><td>" + stateRank + "</td>");

          table.append(resultsList);

          // Add table to the HTML
          $("#results-go-here > tbody").append(table);

          $(".result").on("click", function () {
            var choice = ($(this).attr("id"));

            $(".fourth-row").show();
            $(".fifth-row").show();
            $(".second-row").hide();
            $(".third-row").hide();

            if (searchResults[choice].rankHistory === null) {
              avgScore = "N/A";
            } else {
              avgScore = searchResults[choice].rankHistory[0].averageStandardScore;
            };

            if (searchResults[choice].rankHistory === null) {
              stateRank = "N/A";
            } else {
              stateRank = searchResults[choice].rankHistory[0].rankStatewidePercentage + " %";
            };

            if (searchResults[choice].isPrivate === true) {
              type = "Private";
            } else if (searchResults[choice].isCharterSchool === "Yes") {
              type = "Charter";
            } else if (searchResults[choice].isMagnetSchool === "Yes") {
              type = "Magnet";
            } else {
              type = "Public";
            }

            if (searchResults[choice].schoolYearlyDetails[0].pupilTeacherRatio === null) {
              ratio = "N/A";
            } else {
              ratio = searchResults[choice].schoolYearlyDetails[0].pupilTeacherRatio;
            };

            $("#school-name").html(searchResults[choice].schoolName);
            $("#address").html(searchResults[choice].address.street);
            $("#level").html(searchResults[choice].schoolLevel + " School");
            $("#state-rank").html(stateRank);
            $("#type").html(type);
            $("#avg-score").html(avgScore.toFixed(2));
            $("#student-size").html(searchResults[choice].schoolYearlyDetails[0].numberOfStudents);
            $("#ratio").html(ratio);
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
    $(".second-row").show();
    $(".third-row").show();
    $(".fourth-row").hide();
    $(".fifth-row").hide();
  });

  //enter/return key to trigger onclick function
  $("#postal-code").keypress(function (e) {
    if (e.which === 13) {
      $("#submit-info").click();
    }
  });
});



