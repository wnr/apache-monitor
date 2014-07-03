var request = require("request");

var apacheStatusUrl = process.argv[2];
var port = process.argv[3] || 8000;

if(!apacheStatusUrl) {
    return console.log("Usage: apachemonitor url [port]");
}

var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);

app.get("/", function(req, res) {
    res.sendfile("index.html");
});

app.get("/bower_components/chartjs/Chart.min.js", function(req, res) {
    res.sendfile("bower_components/chartjs/Chart.min.js");
});

http.listen(port, function() {
    console.log("Listening on port " + port);
});

io.on("connection", function(socket) {
    console.log("Connection");
});

apacheStatusUrl = apacheStatusUrl.split("?")[0] + "?q=auto";

setInterval(readApacheStatus.bind(null, apacheStatusUrl, broadcast), 1000);

function broadcast(data) {
    data.timestamp = new Date();
    io.emit("status", data);
};

function readApacheStatus(url, callback) {
    function convertToJson(body) {
        var lines = body.split("\n");

        var json = "{";

        for(var i = 0; i < lines.length; i++) {
            if(i === lines.length - 2) {
                break;
            }

            var tuple = lines[i].split(":");

            json += "\"" + tuple[0] + "\"";

            json += ":" + tuple[1];

            if(i !== lines.length - 3) {
                json += ",";
            }
        }

        json += "}";

        return JSON.parse(json);
    }

    function map(object) {
        var output = {};

        output.cpu = object.CPULoad;

        return output;
    }

    request(url, function(err, response, body) {
        if(err) {
            return console.error("Failed to request apache status: ", err);
        }

        if(response.statusCode !== 200) {
            return console.error("Failed to request apache status: ", response);
        }

        var data = convertToJson(body);

        callback(map(data));
    });
}
