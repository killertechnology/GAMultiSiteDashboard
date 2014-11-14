
var authToken = '';
var clientId = '190730675266-khuda0vc84f3h3ia1n580so1fsej40ki.apps.googleusercontent.com';
var apiKey = 'AIzaSyBoYc76Sng3ZgHGJv7VImg_HWgdn5VAtN4';
var scopes = 'https://www.googleapis.com/auth/analytics.readonly';

var handleClientLoad = (function () {
  gapi.client.setApiKey(apiKey);
  window.setTimeout(checkAuth, 1);
});

var checkAuth = (function () {
  gapi.auth.authorize({
    client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
});

var handleAuthResult = (function (authResult) {
  if (authResult) {
    authToken = authResult;
    gapi.client.load('analytics', 'v3', handleAuthorized);
  } else {
    handleUnAuthorized();
  }
});

var handleUnAuthorized = (function () {
  var authorizeButton = document.getElementById('authorize-button');
  var runDemoButton = document.getElementById('run-demo-button');

  runDemoButton.style.visibility = 'hidden';
  authorizeButton.style.visibility = '';
  authorizeButton.onclick = handleAuthClick;
  console.log('Please authorize this script to access Google Analytics.');
});


var handleAuthClick = (function (event) {
  gapi.auth.authorize({
    client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
  return false;
});



//*******************
var myReports = {
    "0": 72135594, // smiledrive.vw.com (App)
    "1": 57178418, // www.realcaliforniamilk.com
    "2": 79231336, // www.fuelcaster.com
    //"3": 86313297, // mk8testingfacility.nintendo.com
    "3": 57148159, // partofyourfamily.realcaliforniamilk.com
    "4": 78146136, // www.emeraldnuts.com
    "5": 19944780, // www.deutschinc.com
    "6": 58438443, // blog.deutschinc.com
    "7": 84703884,	//dprep.me
    "8": 65838431, // www.popsecretlabs.com
    "9": 58438443 // www.popsecret.com
};




