// This is the main JS for the USERVER RESTFul server
var https = require('https');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var fs = require('fs');
var mysql = require('mysql');
var clear = require('clear');
var log4js = require('log4js');
var nconf = require('nconf');
var morgan = require('morgan');
var cfile = null;

// Initialize log4js
log4js.loadAppender('file');
var logname = 'aserver';
log4js.configure({
    appenders: [{
        type: 'dateFile',
        filename: 'logs/' + logname + '.log',
        alwaysIncludePattern: false,
        maxLogSize: 20480,
        backups: 10
    }]
});

// Get the name of the config file from the command line (optional)
nconf.argv().env();

cfile = '../dat/config.json';

//Validate the incoming JSON config file
try {
    var content = fs.readFileSync(cfile, 'utf8');
    var myjson = JSON.parse(content);
    console.log("Valid JSON config file");
} catch (ex) {
    console.log("Error in " + cfile);
    console.log('Exiting...');
    console.log(ex);
    process.exit(1);
}

var logger = log4js.getLogger(logname);

nconf.file({
    file: cfile
});
var configobj = JSON.parse(fs.readFileSync(cfile, 'utf8'));

//the presence of the clearText field in config.json means that the file is in clear text
//remove the field if the file is encoded
var clearText = false;
if (typeof (nconf.get('common:cleartext')) !== "undefined") {
    console.log('clearText field is in config.json. assuming file is in clear text');
    clearText = true;
}

// Set log4js level from the config file
logger.setLevel(decodeBase64(nconf.get('common:debug_level')));
logger.trace('TRACE messages enabled.');
logger.debug('DEBUG messages enabled.');
logger.info('INFO messages enabled.');
logger.warn('WARN messages enabled.');
logger.error('ERROR messages enabled.');
logger.fatal('FATAL messages enabled.');
logger.info('Using config file: ' + cfile);



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
    host: decodeBase64(nconf.get('database_servers:mysql:host')),
    user: decodeBase64(nconf.get('database_servers:mysql:user')),
    password: decodeBase64(nconf.get('database_servers:mysql:password')),
    database: decodeBase64(nconf.get('database_servers:mysql:agent_database_name'))
});
connection.connect();
// Keeps connection from Inactivity Timeout
setInterval(function () {
    connection.ping();
}, 60000);

// Start the server
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(__dirname + '/apidoc'));
/*app.use(bodyParser.json({
    type: 'application/vnd/api+json'
}));
*/
var routes = require('./routes/routes.js')(app, connection);

if (decodeBase64(nconf.get('agent_service:protocol')) === "https") {
    console.log("https");
    var credentials = {
        key: fs.readFileSync(decodeBase64(nconf.get('common:https:private_key'))),
        cert: fs.readFileSync(decodeBase64(nconf.get('common:https:certificate')))
    };
    var server = https.createServer(credentials, app);
} else {
    var server = http.createServer(app);
}

server.listen(parseInt(decodeBase64(nconf.get('agent_service:port'))));
console.log(decodeBase64(nconf.get('agent_service:protocol'))+' web server for agent portal up and running on port %s   (Ctrl+C to Quit)', parseInt(decodeBase64(nconf.get('agent_service:port'))));

// Handle Ctrl-C (graceful shutdown)
process.on('SIGINT', function () {
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
    var decodedString = null;
    if (clearText) {
        return encodedString;
    } else {
        decodedString = new Buffer(encodedString, 'base64');
    }
    return (decodedString.toString());
}
