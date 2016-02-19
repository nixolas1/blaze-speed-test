var hrtime = require('browser-process-hrtime');
var speedtest = require('speedtest-net');
var http = require('http');
var fileName = 'history';
if (localStorage.getItem(fileName) === null) {
  localStorage.setItem(fileName, "[]");
}
var history = JSON.parse(localStorage.getItem(fileName));
var socket = require('socket.io-client')(process.argv[2] || 'http://bl4ze.herokuapp.com');
var num_speedtests = 0;
var tot_speedtests = 0;

socket.on('connect', function () {
    console.log('Logger is connected');
});


//Sent all history
socket.on('logger:history', function () {
    socket.emit('server:results', history);
    console.log("logger:history");
});

socket.on('logger:run', function () {
    //never run more than one instance of the speed test at the same time to ensure consistent results
    if(num_speedtests < 1){
        num_speedtests++;
        tot_speedtests++;
        console.log('Starting speedtest #'+history.length);
        
        var test = speedtest();

        test.on('data', function (data) {
            var result = {
                download: data.speeds.download,
                upload: data.speeds.upload,
                ping: data.server.ping,
                date: Date.now()
            };

            history.push(result);

            //Send newest test results only
            socket.emit('server:last', result);

            var jsonResult = JSON.stringify(history);
            localStorage.setItem(fileName, jsonResult);
            num_speedtests--;
        });

        test.on('error', function (err) {
            console.error(err);
            num_speedtests--;
        });
    }
});