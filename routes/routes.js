/**
 * Define the different REST service routes in this file.
 *
 * @param (type) app Instance of express
 * @param (type) connection Retrieves DB from the MySQL server
 * @returns (undefined) Not used
 */

var appRouter = function (app, connection, asterisk) {

    /**
     * @api {get} /AgentVerify Verify an agent by username and password.
     * @apiName AgentVerify
     * @apiGroup AgentVerify
     * @apiVersion 1.0.0
     *
     * @apiParam {String} username   username for the agent.
     * @apiParam {String} password   password for the agent.
     *
     * @apiSuccessExample Success-Response
     *     HTTP/1.1 200 OK
     *    {
     *      "message":"success",
     *      "data":[{
     *             agent_id: 0,
     *             username: "CSRAgent0",
     *             first_name: "John",
     *             last_name: "Smith",
     *             phone: "1112223333",
     *             role:"Agent",
     *             email:"jsmith@email.xyz",
     *             organization:"call center xyz",
     *             is_approved: 1,
     *             is_active: 1,
     *             extension: 1234,
     *             extension_secret: "ABC123",
     *             queue_name: "Queue1234",
     *             queue_name: null
     *            }]
     *    }
     * @apiErrorExample 400 Error-Response
     *     HTTP/1.1 400 BadRequest Bad Request Error
     *     {
     *        'message': 'missing username'
     *     }
     * @apiErrorExample 400 Error-Response
     *     HTTP/1.1 400 BadRequest Bad Request Error
     *     {
     *        'message': 'missing password'
     *     }
     * @apiErrorExample 404 Error-Response
     *     HTTP/1.1 404 Not Found
     *     {
     *        'message': 'Login failed'
     *     }
     * @apiErrorExample 500 Error-Response
     *     HTTP/1.1 500 Internal Server Error
     *     {
     *        'message': 'mysql error'
     *     }
     * @apiErrorExample 501 Error-Response
     *     HTTP/1.1 501 Not implemented
     *     {
     *        'message': 'records returned is not 1'
     *     }
     */

    app.get('/agentverify', function (req, res) {
        if (!req.query.username) {
            return res.status(400).send({
                'message': 'missing username'
            });
        } else if (!req.query.password) {
            return res.status(400).send({
                'message': 'missing password'
            });
        } else {
            //Query DB for agent info
            connection.query('SELECT ad.agent_id, ad.username, ad.first_name, ad.last_name, ad.role, ad.phone, ad.email, ad.organization, ad.is_approved, ad.is_active, ae.extension, ae.extension_secret, aq.queue_name, aq2.queue_name AS queue2_name, ad.layout, oc.channel FROM agent_data AS ad LEFT JOIN asterisk_extensions AS ae ON ad.agent_id = ae.id LEFT JOIN asterisk_queues AS aq ON aq.id = ad.queue_id LEFT JOIN asterisk_queues AS aq2 ON aq2.id = ad.queue2_id LEFT JOIN outgoing_channels AS oc ON oc.id = ae.id WHERE ad.username = ? AND BINARY ad.password = ?', [req.query.username, req.query.password], function (err, rows, fields) {
                if (err) {
                    console.log(err);
                    return res.status(500).send({
                        'message': 'mysql error'
                    });
                } else if (rows.length === 1) {
                    //success
                    json = JSON.stringify(rows);
                    res.status(200).send({
                        'message': 'success',
                        'data': rows
                    });
                } else if (rows.length === 0) {
                    return res.status(404).send({
                        'message': 'Login failed'
                    });
                } else {
                    console.log('error - records returned is ' + rows.length);
                    return res.status(501).send({
                        'message': 'records returned is not 1'
                    });
                }
            });
        }
    });

    /**
     * @api {get} /GetAllAgentRecs Gets a dump of all Agent Records in the database.
     * @apiName Get All Agent Recs
     * @apiGroup GetAllAgentRecs
     * @apiVersion 1.0.0
     *
     * @apiSuccessExample 200 Success-Response
     *     HTTP/1.1 200 OK
     *    {
     *      "message":"success",
     *      "data":[{
     *             agent_id: 0,
     *             username: "CSRAgent0",
     *             first_name: "John",
     *             last_name: "Smith",
     *             phone: "1112223333",
     *             role:"Agent",
     *             email:"jsmith@email.xyz",
     *             organization:"call center xyz",
     *             is_approved: 1,
     *             is_active: 1,
     *             extension: 1234,
     *             extension_secret: "ABC123",
     *             queue_name: "Queue1234",
     *             queue_name: null
     *            },{
     *             ...
     *            }]
     *    }
     *
     * @apiSuccessExample 204 Success-Response
     *     HTTP/1.1 204 No Content
     *    {
     *      "message":"no agent records"
     *    }
     * @apiErrorExample 500 Error-Response
     *     HTTP/1.1 500 Internal Server Error
     *     {
     *        'message': 'mysql error'
     *     }
     */


    app.get('/getallagentrecs', function (req, res) {
        //Query DB for all agent records
        connection.query('SELECT ad.agent_id, ad.username, ad.first_name, ad.last_name, ad.role, ad.phone, ad.email, ad.organization, ad.is_approved, ad.is_active, ae.extension, ae.extension_secret, aq.queue_name, aq2.queue_name AS queue2_name, oc.channel FROM agent_data AS ad LEFT JOIN asterisk_extensions AS ae ON ad.agent_id = ae.id LEFT JOIN asterisk_queues AS aq ON aq.id = ad.queue_id LEFT JOIN asterisk_queues AS aq2 ON aq2.id = ad.queue2_id LEFT JOIN outgoing_channels AS oc ON oc.id = ae.id ORDER BY agent_id', function (err, rows, fields) {
            if (err) {
                console.log(err);
                return res.status(500).send({
                    'message': 'mysql error'
                });
            } else if (rows.length > 0) {
                //success
                json = JSON.stringify(rows);
                res.status(200).send({
                    'message': 'success',
                    'data': rows
                });
            } else if (rows.length === 0) {
                return res.status(204).send({
                    'message': 'no agent records'
                });
            }
        });
    });

    /**
     * @api {get} /GetAgentRec Gets a dump of a single Agent Record from the database.
     * @apiName Get Agent Rec
     * @apiGroup GetAgentRec
     * @apiVersion 1.0.0
     *
     * @apiSuccessExample 200 Success-Response
     *     HTTP/1.1 200 OK
     *    {
     *      "message":"success",
     *      "data":[{
     *             agent_id: 0,
     *             username: "CSRAgent0",
     *             first_name: "John",
     *             last_name: "Smith",
     *             phone: "1112223333",
     *             role:"Agent",
     *             email:"jsmith@email.xyz",
     *             organization:"call center xyz",
     *             is_approved: 1,
     *             is_active: 1,
     *             extension: 1234,
     *             extension_secret: "ABC123",
     *             queue_name: "Queue1234",
     *             queue_name: null
     *            }]
     *    }
     *
     * @apiSuccessExample 200 Success-Response
     *     HTTP/1.1 200 OK
     *    {
     *        "message": "no agent records",
     *        "data": ""
     *    }
     * @apiErrorExample 500 Error-Response
     *     HTTP/1.1 500 Internal Server Error
     *     {
     *        'message': 'mysql error'
     *     }
     */
    app.get('/getagentrec/:username', function (req, res) {
        //Query DB for an agent record
        connection.query('SELECT ad.agent_id, ad.username, ad.first_name, ad.last_name, ad.role, ad.phone, ad.email, ad.organization, ad.is_approved, ad.is_active, ae.extension, ae.extension_secret, aq.queue_name,  ad.layout, aq2.queue_name AS queue2_name, oc.channel FROM agent_data AS ad LEFT JOIN asterisk_extensions AS ae ON ad.agent_id = ae.id LEFT JOIN asterisk_queues AS aq ON aq.id = ad.queue_id LEFT JOIN asterisk_queues AS aq2 ON aq2.id = ad.queue2_id LEFT JOIN outgoing_channels AS oc ON oc.id = ae.id WHERE ad.username =  ?', [req.params.username], function (err, rows, fields) {
            if (err) {
                console.log(err);
                return res.status(500).send({
                    'message': 'mysql error'
                });
            } else if (rows.length > 0) {
                //success
                json = JSON.stringify(rows);
                res.status(200).send({
                    'message': 'success',
                    'data': rows
                });
            } else if (rows.length === 0) {
                return res.status(200).send({
                    'message': 'no agent records',
                    'data': ''
                });
            }
        });
    });

    /**
     * @api {get} /GetScript Gets a specify CSR Agent Script by queue name from the database.
     * @apiName GetScript
     * @apiGroup GetScript
     * @apiVersion 1.0.0
     *
     * @apiParam {String} queue_name   Queue name for associated with a script.
     *
     * @apiSuccessExample 200 Success-Response
     *     HTTP/1.1 200 OK
     *    {
     *      "message":"success",
     *      "data":[{
     *               "id": 0,
     *               "queue_name": "Complaints",
     *               "text": "The script text the agent will say to the caller.....",
     *               "date": '2016-04-01',
     *               "type": 'Complaint Script'
     *            }]
     *    }
     *
     * @apiErrorExample 400 Error-Response
     *     HTTP/1.1 400 BadRequest Bad Request Error
     *     {
     *        'message': 'missing queue_name field'
     *     }
     * @apiErrorExample 404 Not-Found-Response
     *     HTTP/1.1 404 Not Found
     *    {
     *      "message":"script not found"
     *    }
     * @apiErrorExample 500 Error-Response
     *     HTTP/1.1 500 Internal Server Error
     *     {
     *        'message': 'mysql error'
     *     }
     */

    app.get('/getscript', function (req, res) {
        if (!req.query.queue_name) {
            return res.status(400).send({
                'message': 'missing queue_name field'
            });
        } else {
            //Query DB for script info
            connection.query('SELECT s.id, aq.queue_name, s.text, s.date, s.type FROM scripts AS s, asterisk_queues AS aq WHERE s.queue_id = aq.id AND aq.queue_name = ?', [req.query.queue_name], function (err, rows, fields) {
                if (err) {
                    console.log(err);
                    return res.status(500).send({
                        'message': 'mysql error'
                    });
                } else if (rows.length >= 1) {
                    //success
                    json = JSON.stringify(rows);
                    res.status(200).send({
                        'message': 'success',
                        'data': rows
                    });
                } else if (rows.length === 0) {
                    return res.status(404).send({
                        'message': 'script not found'
                    });
                }
            });
        }
    });

    /**
     * @api {get} /GetAllScripts Gets a dump of all CSR Agent Scripts from the database.
     * @apiName GetAllScripts
     * @apiGroup GetAllScripts
     * @apiVersion 1.0.0
     *
     * @apiSuccessExample 200 Success-Response
     *     HTTP/1.1 200 OK
     *    {
     *      "message":"success",
     *      "data":[{
     *               "id": 0,
     *               "queue_name": "Complaints",
     *               "text": "The script text the agent will say to the caller.....",
     *               "date": '2016-04-01',
     *               "type": 'New Complaint Script'
     *            },{
     *               "id": 1,
     *               "queue_name": "Other",
     *               "text": "The script text the agent will say to the caller.....",
     *               "date": '2016-04-15',
     *               "type": 'Other Type'
     *           }]
     *    }
     *
     * @apiErrorExample 404 Not-Found-Response
     *     HTTP/1.1 404 Not Found
     *    {
     *      "message":"script not found"
     *    }
     * @apiErrorExample 500 Error-Response
     *     HTTP/1.1 500 Internal Server Error
     *     {
     *        'message': 'mysql error'
     *     }
     */

    app.get('/getallscripts', function (req, res) {

        //Query DB for script info
        connection.query('SELECT s.id, aq.queue_name, s.text, s.date, s.type FROM scripts AS s, asterisk_queues AS aq WHERE s.queue_id = aq.id', function (err, rows, fields) {
            if (err) {
                console.log(err);
                return res.status(500).send({
                    'message': 'mysql error'
                });
            } else if (rows.length >= 1) {
                //success
                json = JSON.stringify(rows);
                res.status(200).send({
                    'message': 'success',
                    'data': rows
                });
            } else if (rows.length === 0) {
                return res.status(404).send({
                    'message': 'script not found'
                });
            }
        });
    });

    /*
     * This is just for testing the connection, no APIdoc info required.
     * GET request; e.g. https://localhost:8085/
     */

    app.get('/', function (req, res) {
        return res.status(200).send({
            'message': 'Welcome to the agent portal.'
        });
    });

    /**
     * @api {post} /UpdateProfile Updates an Agent's information in the database.
     * @apiName Updates an Agent Record
     * @apiGroup UpdateProfile
     * @apiVersion 1.0.0
     *
     * @apiParam {String} agent_id CSR Agent ID Number from the Database
     * @apiParam {String} first_name First name of the CSR Agent user
     * @apiParam {String} last_name Last name of the CSR Agent user
     * @apiParam {String} role Role of the CSR Agent user
     * @apiParam {String} phone Phone number for the CSR Agent user
     * @apiParam {String} email Email address for the CSR Agent user
     * @apiParam {String} orgainization ORganization for the CSR Agent user
     * @apiParam {Boolean} is_approved A boolean value.
     * @apiParam {Boolean} is_active A boolean value.
     *
     * @apiSuccessExample Success-Response
     *     HTTP/1.1 200 OK
     *    {
     *      "message":"Success!"
     *    }
     * @apiErrorExample 400 Error-Response
     *     HTTP/1.1 400 BAD Request
     *     {
     *        'message': 'Missing required field(s)'
     *     }
     *
     * @apiErrorExample 500 Error-Response
     *     HTTP/1.1 500 Internal Server Error
     *     {
     *        'message': 'MySQL error'
     *     }
     */


    app.post('/updateProfile', function (req, res) {
        var agent_id = req.body.agent_id;
        var first_name = req.body.first_name;
        var last_name = req.body.last_name;
        var role = req.body.role;
        var phone = req.body.phone;
        var email = req.body.email;
        var organization = req.body.organization;
        var is_approved = Boolean(req.body.is_approved);
        var is_active = Boolean(req.body.is_active);
        if (!agent_id || !first_name || !last_name || !role || !phone || !email || !organization || isNaN(is_approved) || isNaN(is_active)) {
            return res.status(400).send({
                'message': 'Missing required field(s)'
            });
        } else {
            var query = 'UPDATE agent_data SET first_name = ?' +
                ', last_name = ?' +
                ', role = ?' +
                ', phone = ?' +
                ', email = ?' +
                ', organization = ?' +
                ', is_approved = ?' +
                ', is_active = ?' +
                ' WHERE agent_id = ?';
            // Query for all records sorted by the id
            connection.query(query, [first_name, last_name, role, phone, email, organization, is_approved, is_active, agent_id], function (err, results) {
                if (err) {
                    console.log(err);
                    return res.status(500).send({
                        'message': 'MySQL error'
                    });
                } else if (results.affectedRows > 0) {
                    return res.status(200).send({
                        'message': 'Success!'
                    });
                } else {
                    return res.status(200).send({
                        'message': 'Failed!'
                    });
                }
            });
        }

    });



    /**
     * @api {post} /addAgents ADDS agents to the agent_data table. username and email must be unique, or else the add is ignored.
     * @apiName Adds agent_data records
     * @apiGroup AddAgents
     * @apiVersion 1.0.0
     * 
     *
     * @apiSuccessExample Success-Response
     *     HTTP/1.1 200 OK
     *    {
     *      "message":"Success!"
     *    }
     * @apiErrorExample Error-Response
     *     HTTP/1.1 200 OK
     *    {
     *      "message":"Error messages..."
     *    }
     */
    /*
     Expected Input json:
     
     {
          "data": [{
          }, {
              "username": "<insert username>",
              "password": "<insert password>",
              "first_name": "<insert fname>",
              "last_name": "<insert lname>",
              "role": "<insert role>",
              "phone": "<insert phone>",
              "email": "<insert email>",
              "organization": "<insert organization>",
              "is_approved": 0,
              "is_active": 0,
              "extension_id": 0,
              "queue_id": 0,
              "queue2_id": 0
          },{
              "username": "<insert username>",
              "password": "<insert password>",
              "first_name": "<insert fname>",
              "last_name": "<insert lname>",
              "role": "<insert role>",
              "phone": "<insert phone>",
              "email": "<insert email>",
              "organization": "<insert organization>",
              "is_approved": 0,
              "is_active": 0,
              "extension_id": 0,
              "queue_id": 0,
              "queue2_id": 0
          }]
      }
     
     */
    app.post('/addAgents', function (req, res) {
        var agents = req.body.data;
        var sqlInsert = "INSERT INTO agent_data (username, password, first_name, last_name, role, phone, email, organization, is_approved, is_active, extension_id, queue_id, queue2_id) VALUES ?;"
        var values = [];

        for (var rec of agents) {
            let username = rec.username;
            let password = rec.password;
            let first_name = rec.first_name;
            let last_name = rec.last_name;
            let role = rec.role;
            let phone = rec.phone;
            let email = rec.email;
            let organization = rec.organization;
            let is_approved = rec.is_approved || 0;
            let is_active = rec.is_active || 0;
            let extension_id = rec.extension_id || 'NULL';
            let queue_id = rec.queue_id || 'NULL';
            let queue2_id = rec.queue2_id || 'NULL';

            values.push([username, password, first_name, last_name, role, phone, email, organization, is_approved, is_active, extension_id, queue_id, queue2_id]);
        }

        connection.query(sqlInsert, [values], function (err, results) {
            if (err) {
                //an mysql error occurred
                res.status(200).send({
                    'status': 'Failure',
                    'message': 'mysql Error'
                });
            } else if (results.affectedRows == 0) {
                // no mysql error but insert failed
                res.status(200).send({
                    'status': 'Failure',
                    'message': 'No records created'
                })
            } else {
                // insert was successful
                res.status(200).send({
                    'status': 'Success',
                    'message': results.affectedRows + ' of ' + values.length + 'records created.'
                })
            }
        });
    });



    /**
    /**
     * @api {post} /DeleteAgent Deletes an Agent's information in the database.
     * @apiName Delete an Agent Record
     * @apiGroup DeleteAgent
     * @apiVersion 1.0.0
     *
     * @apiParam {String} agent_id CSR Agent ID Number from the Database
     *
     * @apiSuccessExample Success-Response
     *     HTTP/1.1 200 OK
     *    {
     *      "message":"Success!"
     *    }
     * @apiErrorExample 400 Error-Response
     *     HTTP/1.1 400 BAD Request
     *     {
     *        'message': 'Missing required field(s)'
     *     }
     *
     * @apiErrorExample 500 Error-Response
     *     HTTP/1.1 500 Internal Server Error
     *     {
     *        'message': 'MySQL error'
     *     }
     */

    app.post('/DeleteAgent', function (req, res) {
        var agent_id = req.body.agent_id;
        if (!agent_id) {
            return res.status(400).send({
                'message': 'Missing required field'
            });
        } else {
            var query = 'DELETE FROM agent_data WHERE agent_id = ?';
            connection.query(query, agent_id, function (err, results) {
                if (err) {
                    console.log(err);
                    return res.status(500).send({
                        'message': 'MySQL error'
                    });
                } else if (results.affectedRows > 0) {
                    return res.status(200).send({
                        'message': 'Success!'
                    });
                } else {
                    return res.status(200).send({
                        'message': 'Failed!'
                    });
                }
            });
        }
    });


    /**
     * @api {post} /updateLayoutConfig UPDATES the layout column in the agent_data table. Layout controls the size and location of boxes on agent page.
     *                        
     * @apiName Update Layout Config
     * @apiGroup UpdateLayoutConfig
     * @apiVersion 1.0.0
     * 
     * @apiParam {String} agent_id CSR Agent ID Number from the Database
     * @apiParam {JSON} layout Json layout configuration
     *
     * @apiSuccessExample Success-Response
     *     HTTP/1.1 200 OK
     *    {
     *      "message":"Success!"
     *    }
     * @apiErrorExample 400 Error-Response
     *     HTTP/1.1 400 BAD Request
     *     {
     *        'message': 'Missing Parameters'
     *     }
     *
     * @apiErrorExample 500 Error-Response
     *     HTTP/1.1 500 Internal Server Error
     *     {
     *        'message': 'MySQL error'
     *     }
     */


    app.post('/updateLayoutConfig', function (req, res) {
        var layout = JSON.stringify(req.body.layout)
        var agent_id = req.body.agent_id;
        var query = 'UPDATE agent_data SET layout = ? WHERE agent_id = ?';

        if (layout && agent_id) {
            connection.query(query, [layout, agent_id], function (err, results) {
                if (err) {
                    console.log(err);
                    return res.status(500).send({
                        'message': 'MySQL error'
                    });
                } else if (results.affectedRows > 0) {
                    return res.status(200).send({
                        'message': 'Success!'
                    });
                } else {
                    return res.status(200).send({
                        'message': 'Failed!'
                    });
                }
            });
        } else {
            res.status(400).send({
                'message': 'Missing Parameters'
            });
        }

    });


    app.get('/OperatingHours', function (req, res) {
        let today = new Date();
        let currentTime = parseFloat(today.getUTCHours() + '.' + (today.getUTCMinutes() < 10? '0' : '') + today.getUTCMinutes() );
        let responseJson = {
            "current": today
        }
        let sqlQuery = 'SELECT id, start, end, business_mode FROM asterisk_operating_status WHERE id = 1;'

        connection.query(sqlQuery, function (err, result) {
            if (err) {
                res.status(200).send({
                    'status': 'Failure',
                    'message': 'mysql Error'
                });
            } else {
                let startTime = result[0].start;
                let endTime = result[0].end;
                let business_mode = result[0].business_mode || 0;

                responseJson.status = 'Success'
                responseJson.message = 'Server responding with Start and End times.'
                responseJson.start = startTime;
                responseJson.end = endTime;
                responseJson.business_mode = business_mode;

                let start = parseFloat(startTime.replace(":", "."));
                let end = parseFloat(endTime.replace(":", "."));

                if (end <= start)
                    end = end + 24.00;

                if (currentTime < start)
                    currentTime = currentTime + 24.00;

                if ((currentTime >= start && currentTime < end && business_mode != 2) || business_mode == 1) {
                    responseJson.isOpen = true;
                } else if (business_mode == 2) {
                    responseJson.isOpen = false;
                } else {
                    responseJson.isOpen = true;
                }

                res.status(200).send(responseJson);
            }
        });
    });

    app.post('/OperatingHours', function (req, res) {
        let start = req.body.start;
        let end = req.body.end;
        let business_mode = req.body.business_mode || 0;
        if (start && end) {
            let sqlQuery = 'INSERT INTO asterisk_operating_status (id, start, end, business_mode) ' +
                ' VALUES (1, ?, ?, ?) ' +
                ' ON DUPLICATE KEY UPDATE ' +
                ' start=VALUES(start), ' +
                ' end=VALUES(end), '+
                ' business_mode=VALUES(business_mode);'

            connection.query(sqlQuery, [start, end, business_mode], function (err, result) {
                if (err) {
                    res.status(200).send({
                        'status': 'Failure',
                        'message': 'mysql Error'
                    });
                } else {
                    
                    asterisk.action({
                        "Action": "DBPut",
                        'family': 'BUSINESS_HOURS',
                        'key': 'START',
                        'val': start

                    }, function (err, res) {});

                    asterisk.action({
                        "Action": "DBPut",
                        'family': 'BUSINESS_HOURS',
                        'key': 'END',
                        'val': end

                    }, function (err, res) {});

                    asterisk.action({
                        "Action": "DBPut",
                        'family': 'BUSINESS_HOURS',
                        'key': 'ACTIVE',
                        'val': business_mode

                    }, function (err, res) {});

                    res.status(200).send({
                        'status': 'Success'
                    });
                }
            });
        } else {
            res.status(400).send({
                'status': 'Failure',
                'message': 'Missing Parameters'
            });
        }
    });



};

module.exports = appRouter;