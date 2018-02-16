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