var request = require("request");

var apacheStatusUrl = process.argv[2];

if(!apacheStatusUrl) {
	return console.log("Usage: apachemonitor url");
}

apacheStatusUrl = apacheStatusUrl.split("?")[0] + "?q=auto";

setInterval(readApacheStatus.bind(null, apacheStatusUrl), 1000);

function readApacheStatus(url) {
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

	request(url, function(err, response, body) {
		if(err) {
			return console.error("Failed to request apache status: ", err);
		}

		if(response.statusCode !== 200) {
			return console.error("Failed to request apache status: ", response);
		}

		var data = convertToJson(body);

		console.log(data.CPULoad);
	});
}
