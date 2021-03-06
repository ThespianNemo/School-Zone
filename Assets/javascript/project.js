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
var schoolNameCollection = [];
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

    if (userZip.length != 5) {
      $(".modal-fade").show();
      $(".control-group").hide();
    }

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

      if (userZip.length === 5 && response.status === "ZERO_RESULTS") {
        $(".modal-two").show();
        $(".control-group").hide();
        mapCenter = null;
      } else {

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
        } else if (response.results[0].address_compenents[6].types[0] === "administrative_area_level_1") {
          stateResult = response.results[0].address_compenents[6].short_name;
        };
      };

      var queryURL = "https://api.schooldigger.com/v1.1/schools?st=" + stateResult + "&zip=" + userZip + "&perPage=50" + "&appID=3d9ff2e4&appKey=cf32743f4707e77808f66d4cbc553e80";

      // ajax function to get search results for the given zip code 
      $.ajax({
        url: queryURL,
        method: 'GET',
      }).then(function (response) {

        if (userZip.length === 5 && response.numberOfSchools === 0) {
          $(".modal-two").show();
          $(".control-group").hide();
        }

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
              icon: DEFAULT_ICON,
            });

            markerCollection.push(marker);
            function attachMyJason(marker, myJSON) {

            }
            for (var i = 0; i < schoolNameCollection.length; i++) {
              var infowindow = new google.maps.InfoWindow({
                content: myJSON[i]
              });
              marker.addListener('click', function () {
                infowindow.open(map, marker);
              });
            }
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
            var choiceInfo = searchResults[choice];

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
            var fullAddress = choiceInfo.address.street + " " + choiceInfo.address.city + " " + choiceInfo.address.state + " " + choiceInfo.address.zip + "-" + choiceInfo.address.zip4;
            var avgScore = "";
            var starCount = "";
            var type = "";
            var contact = choiceInfo.phone;
            var ratio = "";
            var district = "";
            var africanAm = choiceInfo.schoolYearlyDetails[0].percentofAfricanAmericanStudents + " %";
            var caucasian = choiceInfo.schoolYearlyDetails[0].percentofWhiteStudents + " %";
            var hispanic = choiceInfo.schoolYearlyDetails[0].percentofHispanicStudents + " %";
            var asianAm = choiceInfo.schoolYearlyDetails[0].percentofAsianStudents + " %";
            var indianAm = choiceInfo.schoolYearlyDetails[0].percentofIndianStudents + " %";

            if (choiceInfo.rankHistory === null) {
              avgScore = "N/A";
              stateRank = "N/A";
              starCount = "Not Ranked";
              $(".glyphicon").slice(0, 5).removeClass("glyphicon-star-empty").removeClass("glyphicon-star");
            } else {
              avgScore = choiceInfo.rankHistory[0].averageStandardScore.toFixed(2);
              stateRank = choiceInfo.rankHistory[0].rankStatewidePercentage + " %";
              starCount = choiceInfo.rankHistory[0].rankStars;
              $(".glyphicon").slice(0, starCount).removeClass("glyphicon-star-empty").addClass("glyphicon-star");
            };

            if (choiceInfo.isPrivate === true) {
              type = "Private";
            } else if (choiceInfo.isCharterSchool === "Yes") {
              type = "Charter";
            } else if (choiceInfo.isMagnetSchool === "Yes") {
              type = "Magnet";
            } else {
              type = "Public";
            }

            if (choiceInfo.schoolYearlyDetails[0].pupilTeacherRatio === null) {
              ratio = "N/A";
            } else {
              ratio = choiceInfo.schoolYearlyDetails[0].pupilTeacherRatio;
            };

            if (choiceInfo.district === undefined) {
              district = "";
            } else {
              district = choiceInfo.district.districtName;
            };

            //add extended information variables to the page
            $("#school-name").html(choiceInfo.schoolName);
            $("#full-address").html(fullAddress);
            $("#phone").html(contact);
            $("#district").html(district);
            $("#level").html(choiceInfo.schoolLevel + " School");
            $("#state-rank").html(stateRank);
            $("#type").html(type);
            $("#avg-score").html(avgScore);
            $("#student-size").html(choiceInfo.schoolYearlyDetails[0].numberOfStudents);
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

  $("#try-again").on("click", function (event) {
    $(".modal-fade").hide();
    $("#postal-code").val("");
    $(".control-group").show();
  });

  $("#redo").on("click", function (event) {
    $(".modal-two").hide();
    $("#postal-code").val("");
    $(".control-group").show();
  });


  //function for user to return to the full list of schools in zip code
  $("#go-back").on("click", function (event) {
    $(".second-row").show();
    $(".third-row").show();
    $(".fourth-row").hide();
    $(".fifth-row").hide();
    $(".glyphicon").slice(0, 5).removeClass("glyphicon-star").addClass("glyphicon-star-empty");
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




