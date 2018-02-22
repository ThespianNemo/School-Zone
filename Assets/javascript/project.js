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
var keepZip;
var map;
var mapCenter;

// Map function to initiallize map with user's chosen zipcode area
function initMap(mapCenter) {

   map = new google.maps.Map(document.getElementById('map'), {
    center: mapCenter,
    zoom: 10,
  });
}

$("#map").hide();

$(window).on("load", function () {

  $("#submit-info").on("click", function (event) {
    event.preventDefault();


    //grabs zip code user entered
    var userZip = $("#postal-code").val().trim();

    // Save the user zipcode in Firebase
    database.ref().set({
      keepZip: userZip
    });

    //use geo code api to get state from zip code
    var getStateUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=" + userZip + "&key=AIzaSyCJebjxnEgjtzw7YloxNhus_LU08cAmDTA";

    //ajax function to get corresponding state
    $.ajax({
      url: getStateUrl,
      method: "GET"
    }).then(function (response) {
      var stateResult = "";

      //Get latitude and longitude of zipcode area
      mapCenter = response.results[0].geometry.location
      
      initMap(mapCenter)

      //check for State info in object
      if (response.results[0].address_components[2].types[0] === "administrative_area_level_1") {
        stateResult = response.results[0].address_components[2].short_name;
      } else if (response.results[0].address_components[3].types[0] === "administrative_area_level_1") {
        stateResult = response.results[0].address_components[3].short_name;
      } else if (response.results[0].address_components[4].types[0] === "administrative_area_level_1") {
        stateResult = response.results[0].address_components[4].short_name;
      };

      var queryURL = "https://api.schooldigger.com/v1.1/schools?st=" + stateResult + "&zip=" + userZip + "&perPage=50" + "&appID=3d9ff2e4&appKey=cf32743f4707e77808f66d4cbc553e80";

      // ajax function to get search results for the given zip code 
      $.ajax({
        url: queryURL,
        method: 'GET',
      }).then(function (response) {
          console.log(response);
        //removes search box upon results loading
        $(".first-row").hide();
        //shows the class which default is hidden on load
        $("#map").show();
        $(".second-row").show();
        $(".third-row").show();

        var searchResults = response.schoolList;

        for (var i = 0; i < searchResults.length; i++) {

          var schoolName = searchResults[i].schoolName;
          var street = searchResults[i].address.street;
          var city = searchResults[i].address.city;
          var state = searchResults[i].address.state;
          var level = searchResults[i].schoolLevel;
          var stateRank = "";

          // combine address results into a readable address street+city+state+maybe zipcode
          var address = street + " " + city + " " + state;
          // console.log(address); 
          
          // use google geocode api to return latitude and longitude
          var geocodeUrl= "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=AIzaSyCJebjxnEgjtzw7YloxNhus_LU08cAmDTA";
          // console.log (geocodeUrl);

          //make request to geocodeUrl
          $.ajax({
            url: geocodeUrl,
            method: "GET"
          }).then(function (response) {

            //get lat and long from response
            var coords = response.results[0].geometry.location;

            console.log("coords",coords);

            //Use lat and long to create school markers on the map 
            var marker = new google.maps.Marker({
              position: coords,
              center: mapCenter,
              map: map
            });
//hover marker with school info

          })

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
          var resultsList = ("<td>" + schoolName + "<td>" + street + "</td><td>" +
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

            var fullAddress = searchResults[choice].address.street + " " + searchResults[choice].address.city + " " + searchResults[choice].address.state + " "  + searchResults[choice].address.zip + "-" + searchResults[choice].address.zip4;

            if (searchResults[choice].rankHistory === null) {
              avgScore = "N/A";
            } else {
              avgScore = searchResults[choice].rankHistory[0].averageStandardScore;
            };

            if (searchResults[choice].rankHistory === null) {
              stateRank = "N/A";
              var starCount = "Not Ranked";
            } else {
              stateRank = searchResults[choice].rankHistory[0].rankStatewidePercentage + " %";
              var starCount = searchResults[choice].rankHistory[0].rankStars;
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

            var starDisplay = "<span class='glyphicon glyphicon-star' aria-hidden='true'></span>"
            var starEmpty = "<span class='glyphicon glyphicon-star-empty' aria-hidden='true'></span>"

            if (starCount === 0) {
              starCount = $(starEmpty + starEmpty + starEmpty + starEmpty + starEmpty);
            } else if (starCount === 1) {
              starCount = $(starDisplay + starEmpty + starEmpty + starEmpty + starEmpty);
            } else if (starCount === 2) {
              starCount = $(starDisplay + starDisplay + starEmpty + starEmpty + starEmpty);
            } else if (starCount === 3) {
              starCount = $(starDisplay + starDisplay + starDisplay + starEmpty + starEmpty);
            } else if (starCount === 4) {
              starCount = $(starDisplay + starDisplay + starDisplay + starDisplay + starEmpty);
            } else if (starCount === 5) {
              starCount = $(starDisplay + starDisplay + starDisplay + starDisplay + starDisplay);
            }

            $("#school-name").html(searchResults[choice].schoolName);
            $("#full-address").html(fullAddress);
            $("#star-count").html(starCount);
            $("#level").html(searchResults[choice].schoolLevel + " School");
            $("#state-rank").html(stateRank);
            $("#type").html(type);
            $("#avg-score").html(avgScore.toFixed(2));
            $("#student-size").html(searchResults[choice].schoolYearlyDetails[0].numberOfStudents);
            $("#ratio").html(ratio);

            //additional variables to display on right side of exteneded results page
            var contact = searchResults[choice].phone;
            var africanAm = searchResults[choice].schoolYearlyDetails[0].percentofAfricanAmericanStudents;
            var caucasian = searchResults[choice].schoolYearlyDetails[0].percentofWhiteStudents;
            var hispanic = searchResults[choice].schoolYearlyDetails[0].percentofHispanicStudents;
            var asianAm = searchResults[choice].schoolYearlyDetails[0].percentofAsianStudents;
            var indianAm = searchResults[choice].schoolYearlyDetails[0].percentofIndianStudents;

            $("#caucasian").html("<br>" + caucasian);
            $("#african-american").html(africanAm);
            $("#hispanic").html(hispanic);
            $("#asian-american").html(asianAm);
            $("#indian-american").html(indianAm);

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



