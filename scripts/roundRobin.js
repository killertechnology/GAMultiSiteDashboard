var _iframeIndex = 0;
    var _framename = "";
    var _tableID =0;
    var _realtimeVisitors = 0;
    var _numFramesToShow = 8;

    var getReportID = (function (_iframeIndex){
        for (var prop in myReports) {
          if (myReports.hasOwnProperty(prop)) {
            if (_iframeIndex == eval(prop)){ return myReports[prop]; }
          }
        }
    });

    var LoadIFrameReport = (function(){
        _framename = "#iframe" + _iframeIndex;
        _tableID = getReportID(_iframeIndex);
        $(_framename).html("<iframe src='./gview.html?tableID=ga:" + _tableID + "' scrolling=no frameborder='0' height='119' width='100%' />");
        getRealtimeResults(_iframeIndex);

        _iframeIndex++;
        if (_iframeIndex>=_numFramesToShow){ _iframeIndex=0; }

    });


    var getRealtimeResults = (function (whichIndex) {

        var request = $.ajax({
            url: "https://content.googleapis.com/analytics/v3/data/realtime?ids=ga%3A" + _tableID + "&metrics=rt%3AActiveVisitors&key=" + apiKey,
            type: "GET",
            headers: { authorization:  'Bearer ' + authToken.access_token },
            dataType: "json"
        });

        request.done(function(msg) {
            //console.log('api call has been completed.');
            _realtimeVisitors = eval(msg.totalsForAllResults["rt:ActiveVisitors"]);

            var data = google.visualization.arrayToDataTable([
                ['Label', 'Value'],
                ['Visits', _realtimeVisitors]
            ]);

            var options = {
                max: 50,
                width: 95,
                height: 95,
                redFrom: 35, redTo: 75,
                yellowFrom:15, yellowTo: 35,
                minorTicks: 4
            };

            //console.log('Chart Div IframeIndex: ' + whichIndex);
            var chart = new google.visualization.Gauge(document.getElementById('chart_div'+whichIndex));
            chart.draw(data, options);

        });

        request.fail(function(jqXHR, textStatus) {
            console.log( "Request failed: " + textStatus );
        });

    });


//**********************************************
//******* AUTHORIZATION - DO NOT MODIFY ********
//**********************************************

var handleAuthResult = (function (authResult) {
    var authorizeButton = document.getElementById('authorize-button');
    authToken = authResult;
    if (authResult && !authResult.error) {
      authorizeButton.style.visibility = 'hidden';
      LoadIFrameReport();
    setInterval(LoadIFrameReport,45000);
    } else {
      authorizeButton.style.visibility = '';
      authorizeButton.onclick = handleAuthClick;
    }
});


google.load('visualization', '1', {packages:['gauge']});
google.setOnLoadCallback();
//**********************************************
//**********************************************
//**********************************************

