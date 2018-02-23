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

var map;
var markerCollection = [];
var mapCenter;
var DEFAULT_ICON = 'http://maps.gstatic.com/mapfiles/markers2/icon_green.png';

// Map function to initiallize map with user's chosen zipcode area
function initMap(mapCenter) {

  map = new google.maps.Map(document.getElementById('map'), {
    center: mapCenter,
    zoom: 12,
  });
}

$("#map").hide();

$(window).on("load", function () {

  $("#postal-code").val("");

  $("#submit-info").on("click", function (event) {
    event.preventDefault();

    //grabs zip code user entered
    var userZip = $("#postal-code").val().trim();

    // Save the user zipcode in Firebase
    database.ref().push({
      userZip: userZip,
      dateAdded: firebase.database.ServerValue.TIMESTAMP
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

      var zipCodeBounds = new google.maps.LatLngBounds(response.results[0].geometry.bounds.southwest, response.results[0].geometry.bounds.northeast)


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

        //removes search box upon results loading
        $(".first-row").hide();
        //shows the class which default is hidden on load
        $("#map").show();
        $(".second-row").show();
        $(".third-row").show();
        map.fitBounds(zipCodeBounds);
        map.setCenter(zipCodeBounds.getCenter());

        var searchResults = response.schoolList;

        for (var i = 0; i < searchResults.length; i++) {

          var schoolName = searchResults[i].schoolName;
          var street = searchResults[i].address.street;
          var city = searchResults[i].address.city;
          var state = searchResults[i].address.state;
          var level = searchResults[i].schoolLevel;
          var stateRank = "";

          if (searchResults[i].rankHistory === null) {
            stateRank = "N/A"
          } else {
            stateRank = searchResults[i].rankHistory[0].rankStatewidePercentage + " %";
          };

          // combine address results into a readable address street+city+state+maybe zipcode
          var address = street + " " + city + " " + state;
          // console.log(address); 

          // use google geocode api to return latitude and longitude
          var geocodeUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=AIzaSyCJebjxnEgjtzw7YloxNhus_LU08cAmDTA";
          // console.log (geocodeUrl);

          //make request to geocodeUrl
          $.ajax({
            url: geocodeUrl,
            method: "GET"
          }).then(function (response) {

            //get lat and long from response
            var coords = response.results[0].geometry.location;

            //Use lat and long to create school markers on the map 
            var marker = new google.maps.Marker({
              position: coords,
              center: mapCenter,
              map: map,
              icon: DEFAULT_ICON
            });
            markerCollection.push(marker);
          
          });

          //and unique ID to each item in results
          var ID = i;
          var table = $("<tr>");
          table.attr('id', ID);
          //add a class for results 
          table.addClass("result");

          //add school's data into the table
          var resultsList = ("<td>" + schoolName + "<td>" + address + "</td><td>" +
            level + "</td><td>" + stateRank + "</td>");

          table.append(resultsList);

          // Add table to the HTML
          $("#results-go-here > tbody").append(table);

          //click function to record which school the user selected
          $(".result").on("click", function () {
            var choice = ($(this).attr("id"));

            //method to show marker for choice
            // loop over marker collection
            for (var i = 0; i < markerCollection.length; i++) {
              if (+choice === +i) {

                markerCollection[i].setIcon()
              } else {
                markerCollection[i].setIcon(DEFAULT_ICON)
              }
            };

            $(".fourth-row").show();
            $(".fifth-row").show();
            $(".second-row").hide();
            $(".third-row").hide();

            //additional variables to be displayed on the extended results page
            var fullAddress = searchResults[choice].address.street + " " + searchResults[choice].address.city + " " + searchResults[choice].address.state + " " + searchResults[choice].address.zip + "-" + searchResults[choice].address.zip4;
            var avgScore = "";
            var type = "";
            var contact = searchResults[choice].phone;
            var ratio = "";
            var district = "";
            var africanAm = searchResults[choice].schoolYearlyDetails[0].percentofAfricanAmericanStudents + " %";
            var caucasian = searchResults[choice].schoolYearlyDetails[0].percentofWhiteStudents + " %";
            var hispanic = searchResults[choice].schoolYearlyDetails[0].percentofHispanicStudents + " %";
            var asianAm = searchResults[choice].schoolYearlyDetails[0].percentofAsianStudents + " %";
            var indianAm = searchResults[choice].schoolYearlyDetails[0].percentofIndianStudents + " %";

            if (searchResults[choice].rankHistory === null) {
              avgScore = "N/A";
            } else {
              avgScore = searchResults[choice].rankHistory[0].averageStandardScore.toFixed(2);
            };

            if (searchResults[choice].rankHistory === null) {
              stateRank = "N/A";
              var starCount = "Not Ranked";
            } else {
              stateRank = searchResults[choice].rankHistory[0].rankStatewidePercentage + " %";
              var starCount = searchResults[choice].rankHistory[0].rankStars;
              $(".glyphicon").slice(0, starCount).removeClass("glyphicon-star-empty").addClass("glyphicon-star");
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

            if (searchResults[choice].district === undefined) {
              district = "";
            } else {
              district = searchResults[choice].district.districtName;
            };

            //add extended information variables to the page
            $("#school-name").html(searchResults[choice].schoolName);
            $("#full-address").html(fullAddress);
            $("#phone").html(contact);
            $("#district").html(district);
            $("#level").html(searchResults[choice].schoolLevel + " School");
            $("#state-rank").html(stateRank);
            $("#type").html("Type: " + type);
            $("#avg-score").html(avgScore);
            $("#student-size").html(searchResults[choice].schoolYearlyDetails[0].numberOfStudents);
            $("#ratio").html(ratio);
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

  //allows user to restart their search
  $("#start-over").on("click", function (event) {
    location.reload();
  });

  //function for user to return to the full list of schools in zip code
  $("#go-back").on("click", function (event) {
    $(".second-row").show();
    $(".third-row").show();
    $(".fourth-row").hide();
    $(".fifth-row").hide();
    for (var i = 0; i < markerCollection.length; i++) {
      markerCollection[i].setIcon(DEFAULT_ICON)
    }
  });

  //enter/return key to trigger onclick function
  $("#postal-code").keypress(function (e) {
    if (e.which === 13) {
      $("#submit-info").click();
    }
  });
});



