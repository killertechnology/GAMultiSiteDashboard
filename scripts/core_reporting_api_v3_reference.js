

//*********************
//*********************
//*********************
//Set up global variables
var output = [];
var dpsHourly1 = [ ];   //Visits per hour.
var dpsHourly2 = [ ];   //Pageviews per hour.
var _minHistory = "";
var _hourHistory = "";
var _minCallComplete = true;
var _hourCallComplete = true;
var _screenUpdated = false;


//*********************
// **** AUTHENTICATION - DO NOT REMOVE
//*********************
var handleAuthorized = (function () {
  var authorizeButton = document.getElementById('authorize-button');
  var runDemoButton = document.getElementById('run-demo-button');
  authorizeButton.style.visibility = 'hidden';
  runDemoButton.style.visibility = '';
  runDemoButton.onclick = handleAuthorized;
  makeNthMinuteApiCall();
  makeHourlyApiCall();
});
//*********************
// **** AUTHENTICATION
//*********************


/** * Executes a Core Reporting API query  */
var makeNthMinuteApiCall = (function () {
  gapi.client.analytics.data.ga.get({
	'ids': document.getElementById('table-id').value,
    'start-date': document.getElementById('start-date').value,
    'end-date': document.getElementById('end-date').value,
    'metrics': 'ga:sessions, ga:pageviews, ga:users, ga:newUsers',
    'dimensions': 'ga:nthMinute',
    'segment':'gaid::-1',
    //'sort': '-ga:visits,ga:source',
    //'filters': 'ga:medium==organic',
    'max-results': 1440
  }).execute(handleCoreReportingResults);
});

var makeHourlyApiCall = (function () {
    var weeklyStartDate = lastNDays(0);
    var weeklyEndDate = lastNDays(0);

	gapi.client.analytics.data.ga.get({
	'ids': document.getElementById('table-id').value,
    'start-date': weeklyStartDate,
    'end-date': weeklyEndDate,
    'metrics': 'ga:visits, ga:pageviews',
    'dimensions': 'ga:hour',
    //'sort': '-ga:visits,ga:source',
    //'filters': 'ga:medium==organic',
    'max-results': 24
  }).execute(handleWeeklyCoreReportingResults);
});

/** * Handles the response from the CVore Reporting API.  */
var handleWeeklyCoreReportingResults = (function(resultsWeekly) {
  if (!resultsWeekly.code) {
  	printWeeklyRows(resultsWeekly);
    _hourCallComplete = true;

    if ((_minCallComplete && _hourCallComplete) && (!(_screenUpdated))){ 
      $( "#tblBarChart").html(_minHistory);
      $( "#tblWeeklyChart").html(_hourHistory);
      _screenUpdated = true;
    }
  } 
  else {
    updatePage('There was an error: ' + resultsWeekly.message);
  }
});

/** * Handles the response from the CVore Reporting API.  */
var handleCoreReportingResults = (function(results) {
		
  if (!results.code) {
     printRows(results);
	 _minCallComplete = true;
    if ((_minCallComplete && _hourCallComplete) && (!(_screenUpdated))){ 
      $( "#tblBarChart").html(_minHistory);
      $( "#tblWeeklyChart").html(_hourHistory);
      _screenUpdated = true;
    }
  }
  else {
    updatePage('There was an error: ' + results.message);
  }
});

CanvasJS.addColorSet("greenShades",
        [//colorSet Array
        "#3CB371",
        "#999966",
        "#FFFFCC",
        "#2F4F4F",
        "#90EE90"
]);

//Primary Print Rows function analyzes google data and outputs most recent view
var printRows =(function (results) {
    var _lastrow = results.rows[results.rows.length-1];
    var _newVisits = results.rows[results.rows.length-1];
    var _lastMinuteReported = _lastrow[0];
    var _hourlyChartInterval = 50;
    var _minuteChartInterval = 2;
    var _maxMinuteChartHeight = 3;
    var expectedMinute = 0;
    var dpsMinutes1 = [ ];   //Visits per minute.
    var dpsMinutes2 = [ ];   //Pageviews per minute.
    var dpsMinutes3 = [ ];   //Pageviews per minute.
    var _resultsTotalUsers = 0;
    var _resultsNewUsers = 0;
    var _resultsReturn = 0;
    var _resultsReturnUserPercent = 0;
    var _resultsNewUserPercent = 0;
    var _minutePVCount = 0;
    var _minuteVisitCount = 0;
    var _totalVisitCount = 0;
    var _totalPVCount = 0;
    var _maxTimeToChart = 180;
    var _skipCount = false;

    if (results.rows && results.rows.length) {
        //obtain results for users and new users only
        _resultsTotalUsers = results.totalsForAllResults["ga:users"];
        _resultsNewUsers = results.totalsForAllResults["ga:newUsers"];

        //calculate return user percentage
        _resultsReturn = _resultsTotalUsers - _resultsNewUsers;
        _resultsReturnUserPercent = parseInt((_resultsReturn*100) / _resultsTotalUsers);
        _resultsNewUserPercent = parseInt(100-_resultsReturnUserPercent);

        /* testing/debug code
        console.log("_resultsNewUsers: " + _resultsNewUsers);
        console.log("_resultsTotalUsers: " + _resultsTotalUsers);
        console.log("_resultsReturnUsers: " + _resultsReturn);
        console.log("_resultsReturnUserPercent: " + _resultsReturnUserPercent);
        console.log("_resultsNewUserPercent: " + _resultsNewUserPercent);
        */

        // Put cells in table.
        for (var i = 0, row; row = results.rows[i]; ++i) {
            //console.log("nthMinute: " + parseInt(row[0]));
            currentMinute = row[0];

            if (!(_skipCount)){
                _totalVisitCount = _totalVisitCount+parseInt(row[1]);
                _totalPVCount= _totalPVCount+parseInt(row[2]);
                //console.log("i: " + i + " -- CurrentCount: " + parseInt(row[1]) + " -- _totalVisitCount: " + _totalVisitCount);
            }

            if ((i > (results.rows.length-_maxTimeToChart))){
                if (currentMinute > (_lastMinuteReported - _maxTimeToChart)){
                    if (expectedMinute==0){ expectedMinute = currentMinute; }

                    xVal = expectedMinute;
                    if (currentMinute != expectedMinute)
                    {
                        //Inject an empty minute into the dataset
                        _minuteVisitCount = 0;
                        _minutePVCount = 0;
                        dpsMinutes1.push({x: xVal,y: _minuteVisitCount, label: getTimeString(expectedMinute)});
                        dpsMinutes2.push({x: xVal, y: _minutePVCount });

                        //reset the index back one row and carry on until the minute matches the expected value
                        i--;
                        _skipCount = true;
                    }
                    else
                    {
                        _skipCount = false;
                        _minuteVisitCount = parseInt(row[1]);
                        _minutePVCount = parseInt(row[2]);
                        dpsMinutes1.push({x: xVal,y: _minuteVisitCount, label: getTimeString(expectedMinute)});
                        dpsMinutes2.push({x: xVal, y: _minutePVCount});

                        if ((_minuteVisitCount > _maxMinuteChartHeight) || (_minutePVCount > _maxMinuteChartHeight)){
                          _maxMinuteChartHeight = _minuteVisitCount+2;
                          if (_minutePVCount > _minuteVisitCount) {_maxMinuteChartHeight = _minutePVCount+2;}
                          _minuteChartInterval = Math.floor(_maxMinuteChartHeight/2);
                          //console.log("New Chartheight: " + _maxMinuteChartHeight);
                    }
                }
                //console.log("_minutePVCount: " +_minutePVCount);
                expectedMinute++;
            }
        }
    }

    //update visits count UI component for this chart
    $("#totalVisitsCount").html(_totalVisitCount + " Visits");
    $("#totalPVCount").html(_totalPVCount + " Page Views");

    /////// BEGIN PIE CHART
    dpsMinutes3.push({ y: _resultsNewUserPercent, indexLabel: (_resultsNewUserPercent +"% New"), legendMarkerType: "triangle" });
    dpsMinutes3.push({ y: _resultsReturnUserPercent, indexLabel: (_resultsReturnUserPercent +"% Return"), legendMarkerType: "square" });


    var chart2 = new CanvasJS.Chart("chartContainer2",
        {
            colorSet: "greenShades",
            backgroundColor: "",
            axisX: {
            labelFontColor: "#999966",
            labelFontSize: 11,
            labelAngle: 90,
            titleFontColor: "#999966",
            //title: "Axis X Title2",
            interval:5,
            //interlacedColor: "#191919",
            intervalType: "minutes"
            },
            axisY: {
            maximum: _maxMinuteChartHeight,
            interval: _minuteChartInterval,
            labelFontColor: "#999966",
            titleFontColor: "#999966",
            labelFontSize: 14,
            title: "Vists/Minute"
            //gridColor: "#D7D7D7",
            //tickColor: "#D7D7D7"
            },
            toolTip:{ enabled: false },
              data:[{
                    //markerColor: "#cddeea",
                    markerSize: 1,
                    type: "line",
                    lineThickness: 3,
                    dataPoints: dpsMinutes1
                  },
                  {
                    //markerColor: "#1E90FF",
                    markerSize: 3,
                    type: "line",
                    lineThickness: 1,
                    dataPoints: dpsMinutes2
                  }
              ]
            }
        );

    var pieChart = new CanvasJS.Chart("pieChartContainer",
    {
      backgroundColor: "",
      title:{
        text: "",
        fontFamily: "arial white"

      },
      toolTip:{
        enabled: false
      },
      theme: "theme3",
      data: [
      {
        type: "pie",
        fontFamily: "arial",
        indexLabelFontSize: 13,
        indexLabelFontWeight: "bold",
        startAngle:25,
        indexLabelFontColor: "MistyRose",
        indexLabelLineColor: "darkgrey",
        toolTipContent: "{name}: {y}",
        showInLegend: false,
        dataPoints: dpsMinutes3

      }
      ]
    });

    chart2.render();
    pieChart.render();


}
  else {
    output.push('<p>No rows found.</p>');
  }
});

var strEndsWith = (function (str, suffix) { return str.match(suffix+"$")==suffix; });

var getTimeString = (function (input){
    var div = Math.floor(input/60);
    var rem = input % 60;
    if (rem == 5){ rem = "0" + rem; }
    _output = div + ":" + rem;
    if (strEndsWith(_output,":0")){ _output+="0";}
    return _output;
});

var printWeeklyRows = (function(resultsWeekly) {

    var _hourdisplay = "";
    var _ncount =0;
    var yVal = "";
    var xVal = dpsHourly1.length + 1;
    var _maxHourlyChartHeight = 10;

    if (resultsWeekly.rows && resultsWeekly.rows.length) {

        for (var i = 0, row; row = resultsWeekly.rows[i]; ++i) {
            yVal = parseInt(row[1]);
            _hourdisplay = i;
            _pvCount=parseInt(row[2]);

            //adjust hourly display based on hour
            if (i > 0){ _hourdisplay = ((i) + " AM"); }
            if (i > 11){ _hourdisplay = ((i-12) + " PM"); }
            if (i == 0){ _hourdisplay = "12 AM"; }
            if (i == 12){ _hourdisplay = "12 PM"; }
            dpsHourly1.push({x: i,y: yVal, label:_hourdisplay});    //, indexLabel: "highest",markerColor: "red", markerType: "triangle"
            dpsHourly2.push({x: i,y: _pvCount });

            if ((yVal > _maxHourlyChartHeight) || (_pvCount > _maxHourlyChartHeight)){
                _maxHourlyChartHeight = yVal+3;
                if (_pvCount > yVal){
                    _maxHourlyChartHeight = _pvCount+3;
                }
                _hourlyChartInterval = Math.floor(_maxHourlyChartHeight/2);
            }
        }

        chart = new CanvasJS.Chart("chartContainer",
        {
            backgroundColor: "",
            title :{
            //text: "Visits/Hour"
          },
          axisX: {
            labelFontColor: "white",
            titleFontColor: "white",
            labelFontSize: 10,
            labelAngle: 90,
            //title: "Axis X Title",
            interval:2,
            intervalType: "hour"
          },
          axisY: {
            maximum: _maxHourlyChartHeight,
            interval: _hourlyChartInterval,
            labelFontColor: "white",
            titleFontColor: "white",
            labelFontSize: 14,
            title: "Visits/Hour",
            //gridColor: "#D7D7D7",
            tickColor: "#D7D7D7"
          },
          toolTip:{
            enabled: false
          },
          data: [
            {
              markerColor: "#90f040",
              labelFontColor: "white",
              indexLabelFontSize: 26,
              labelFontSize: 40,
              type: "line",
              lineThickness: 2,
              dataPoints: dpsHourly1
            },
            {
              markerColor: "yellow",
              markerSize: 5,
              //labelFontColor: "green",
              //indexLabelFontSize: 26,
              //labelFontSize: 40,
              type: "line",
              lineThickness: 1,
              dataPoints: dpsHourly2
            }
          ]
        });

        chart.render();

  } else {
    output.push('<p>No Weekly rows found.</p>');
  }
  
});

/** * Utility method to update the output section of the HTML page.  */
var updatePage =(function (output) {   document.getElementById('output').innerHTML = '<br>' + output; });

/** * Utility method to return the lastNdays  */
var lastNDays =(function(n) {
  var today = new Date();
  var before = new Date();
  before.setDate(today.getDate() - n);
  var year = before.getFullYear();
  var month = before.getMonth() + 1;
  if (month < 10) { month = '0' + month; }
  var day = before.getDate();
  if (day < 10) { day = '0' + day; }
  return [year, month, day].join('-');
});




$(document).ready(function(){

    // Initialize the UI Dates.
    document.getElementById('start-date').value = "today";// lastNDays(0);
    document.getElementById('end-date').value ="today";// lastNDays(0);

    //read the querystring value for which GA table to read from
    var tableID = location.search.substring(location.search.indexOf('tableID')).split('&')[0].replace("tableID=","");
    $("#table-id").val(tableID);

    //read the sitename variables from the hidden option list to populate UI
    var _siteName = $('select#table-id option:selected').text();
    document.getElementById("siteName").innerHTML= _siteName;
    //console.log('tableid = ' + tableID);

});