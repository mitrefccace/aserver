// This is the main JS for the USERVER RESTFul server
var https = require('https');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var fs = require('fs');
var mysql = require('mysql');
var clear = require('clear');
var log4js = require('log4js');
var nconf = require('nconf');
var cfile = null;

// Initialize log4js
log4js.loadAppender('file');
var logname = 'aserver';
log4js.configure({
	appenders: [
		{
			type: 'dateFile',
			filename: 'logs/' + logname + '.log',
			alwaysIncludePattern: false,
			maxLogSize: 20480,
			backups: 10
		}
	]
});

// Get the name of the config file from the command line (optional)
nconf.argv().env();

cfile = 'config.json';

//Validate the incoming JSON config file
try {
	var content = fs.readFileSync(cfile,'utf8');
	var myjson = JSON.parse(content);
	console.log("Valid JSON config file");
} catch (ex) {
	console.log("Error in " + cfile);
	console.log('Exiting...');
	console.log(ex);
	process.exit(1);
}

var logger = log4js.getLogger(logname);

nconf.file({file: cfile});
var configobj = JSON.parse(fs.readFileSync(cfile,'utf8'));

// Set log4js level from the config file
logger.setLevel(decodeBase64(nconf.get('debuglevel')));
logger.trace('TRACE messages enabled.');
logger.debug('DEBUG messages enabled.');
logger.info('INFO messages enabled.');
logger.warn('WARN messages enabled.');
logger.error('ERROR messages enabled.');
logger.fatal('FATAL messages enabled.');
logger.info('Using config file: ' + cfile);


var credentials = {
	key: fs.readFileSync(decodeBase64(nconf.get('https:private_key'))),
	cert: fs.readFileSync(decodeBase64(nconf.get('https:certificate')))
};

// process arguments - user supplied port number?
/* var PORT;
var myArgs = process.argv.slice(2);
if (myArgs.length >= 1) {
  PORT = myArgs[0];
}
PORT = PORT || 8085;

clear(); // clear console
*/

// Create MySQL connection and connect to it
var connection = mysql.createConnection({
  host     : decodeBase64(nconf.get('mysql:host')),
  user     : decodeBase64(nconf.get('mysql:user')),
  password : decodeBase64(nconf.get('mysql:password')),
  database : decodeBase64(nconf.get('mysql:database'))
});
connection.connect();
// Keeps connection from Inactivity Timeout
setInterval(function () {
        connection.ping();
}, 60000);

// Start the server
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/apidoc'));
app.use(bodyParser.json({type: 'application/vnd/api+json'}));

var routes = require('./routes/routes.js')(app,connection);
var httpsServer = https.createServer(credentials,app);
httpsServer.listen(parseInt(decodeBase64(nconf.get('port'))));
console.log('https web server for agent portal up and running on port=%s   (Ctrl+C to Quit)', parseInt(decodeBase64(nconf.get('port'))));

// Handle Ctrl-C (graceful shutdown)
process.on('SIGINT', function() {
  console.log('Exiting...');
  connection.end();
  process.exit(0);
});


/**
 * Function to decode the Base64 configuration file parameters.
 * @param {type} encodedString Base64 encoded string.
 * @returns {unresolved} Decoded readable string.
 */
function decodeBase64(encodedString) {

    var decodedString = new Buffer(encodedString, 'base64');
    // console.log('in: ' + encodedString + ', out: ' + decodedString);

    return(decodedString.toString());
}
