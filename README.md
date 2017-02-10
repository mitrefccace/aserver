![](images/acesmall.png)

# ACE ASERVER Project

ASERVER is a server that provides a RESTful Web Service API to the ACE database for agent information.

#### Note: Data in this file are fake. Data are included here for documentation purposes only.

### SSL Configuration
1. ACE software uses SSL which requires a valid key and certificate
1. The location of the SSL key and certificate can be specified in the config.json by using the https:certificate and https:private_key parameters in the form of folder/file (e.g., ssl/mycert.pem and ssl/mykey.pem)
1. Additional information can be found in the ACE Direct Platform Release document

### Getting Started

1. Clone this repository
1. Download and install [Node.js](https://nodejs.org/en/)
1. Install the required Node.js modules: cd into the aserver directory, run `npm install`
1. From the command line:
    * cd aserver
    * npm install
    * npm install apidoc -g
    * apidoc -i routes/ -o apidoc/
    * node app.js

#### Running the Server
Usage:  
node app.js [ port ]

#### Testing the Server in AWS
* curl --request GET http://*hostname:port*/
* curl --request GET http://*hostname:port*/agentverify/?username=<omitted>&password=<omitted>
* curl --request GET http://*hostname:port*/getallagentrecs
* curl -H "Content-Type: application/json" -X POST -d '{"agent_id":25, "first_name": "Marie", "last_name": "C.", "role": "Manager", "phone": "444-444-4444", "email": "administrator@portal.com", "organization": "Organization Zulu", "is_approved": 0, "is_active": 0 }' http://*hostname:port*/updateProfile

# SERVICE API

----

#agentverify

  _Verify an agent ID and password._

* **URL**

  _/agentverify/?username=<omitted>&password=<omitted>_

* **Method:**

   `GET`

*  **URL Params**

   **Required:**

   `username=[string]`
   `password=[string]`

   **Optional:**

   _None._

* **Data Params**

  _None._

* **Success Response:**

  * **Code:** 200, **Content:** `{
  "message": "success",
  "data": [
    {
      "agent_id": 1,
      "username": "<omitted>",
      "first_name": "Ed",
      "last_name": "Jones",
      "role": "manager",
      "phone": "222-000-0000",
      "email": "ed@portal.com",
      "organization": "Organization Bravo",
      "extension": 4001,
      "extension_secret": "<omitted>",
      "queue_name": "GeneralQuestionsQueue",
      "soft_extension": 6000,
      "soft_queue_name": "ComplaintsQueue"    
    }
  ]
}

* **Error Response:**
  * **Code:** 400 BAD REQUEST, **Content:** `{'message': 'missing username'}`
  * **Code:** 400 BAD REQUEST, **Content:** `{'message': 'missing password'}`
  * **Code:** 404 NOT FOUND, **Content:** `{'message': 'username number not found'}`
  * **Code:** 500 INTERNAL SERVER ERROR, **Content:** `{'message': 'mysql error'}`
  * **Code:** 501 NOT IMPLEMENTED, **Content:** `{'message': 'records returned is not 1'}`

* **Sample Call:**

  http://*hostname:port*/agentverify/?username=<omitted>&password=<omitted>

* **Notes:**

  _None._

----
#getallagentrecs

  _Get all the agent records in the agent database._

* **URL**

  _/getallagentrecs_

* **Method:**

   `GET`

*  **URL Params**

   **Required:**

   _None._

   **Optional:**

   _None._

* **Data Params**

  _None._

* **Success Response:**

  * **Code:** 200, **Content:** `{
  	"message": "success",
  	"data": [{
  		"agent_id": 0,
  		"username": "<omitted>",
  		"first_name": "Kevin",
  		"last_name": "Spacey",
  		"role": "administrator",
  		"phone": "000-000-0000",
  		"email": "admin@portal.com",
  		"organization": "Organization Alpha",
  		"is_approved": 1,
  		"is_active": 1,
  		"extension": 5010,
  		"extension_secret": "<omitted>",
  		"queue_name": "ComplaintsQueue",
  		"soft_extension": 6000,
  		"soft_queue_name": "ComplaintsQueue"
  	}, {
  		"agent_id": 1,
  		"username": "<omitted>",
  		"first_name": "Ed",
  		"last_name": "Jones",
  		"role": "manager",
  		"phone": "222-000-0000",
  		"email": "ed@portal.com",
  		"organization": "Organization Bravo",
  		"is_approved": 1,
  		"is_active": 1,
  		"extension": 5011,
  		"extension_secret": "<omitted>",
  		"queue_name": "GeneralQuestionsQueue",
  		"soft_extension": 6000,
  		"soft_queue_name": "ComplaintsQueue"
  	}, {
  		"agent_id": 28,
  		"username": "<omitted>",
  		"first_name": "Mark",
  		"last_name": "Johnson",
  		"role": "agent",
  		"phone": "",
  		"email": "mjohnson123@company.com",
  		"organization": "My Organization",
  		"is_approved": 0,
  		"is_active": 1,
  		"extension": 9012,
  		"extension_secret": "<omitted>",
  		"queue_name": "Queue1010",
  		"soft_extension": 6000,
  		"soft_queue_name": "ComplaintsQueue"
  	}]
  }`

* **Error Response:**
  * **Code:** 204 NO CONTENT, **Content:** `{'message': 'agent_id number not found'}`
  * **Code:** 400 BAD REQUEST, **Content:** `{'message': 'missing agent_id'}`
  * **Code:** 400 BAD REQUEST, **Content:** `{'message': 'missing password'}`
  * **Code:** 404 NOT FOUND, **Content:** `{'message': 'agent_id not found'}`
  * **Code:** 500 INTERNAL SERVER ERROR, **Content:** `{'message': 'mysql error'}`
  * **Code:** 501 INTERNAL SERVER ERROR, **Content:** `{'message': 'records returned is not 1'}`


* **Sample Call:**

  http://*hostname:port*/getallagentrecs

* **Notes:**

  _None._

----

##Test Service

_This is just a test service to quickly check the connection._

* **URL**

  _/_

* **Method:**

  `GET`

*  **URL Params**

   _None._

   **Required:**

   _None._

   **Optional:**

   _None._

* **Data Params**

  _None._

* **Success Response:**
  * **Code:** 200
  * **Content:** `{ "message": "Hello world from the updated agent portal." }`

* **Error Response:**

  _None._

* **Sample Call:**

  http://*hostname:port*/

* **Notes:**

  _None._

----

#getscript

  _Get a script for a particular type of complaint for a complaint queue._

* **URL**

  _/getscript/?type=GeneralComplaint&queue_name=ComplaintsQueue_

* **Method:**

   `GET`

*  **URL Params**

   **Required:**

   `type=[string]`
   `queue_name=[string]`

   **Optional:**

   _None._

* **Data Params**

  _None._

* **Success Response:**

  * **Code:** 200, **Content:** `{"message":"success","data":[{"id":1,"type":"GeneralComplaint","text":"Hello [CUSTOMER NAME], this is [AGENT NAME] calling from Agent Portal Services. Have I caught you in the middle of anything? The purpose for my call is to help improve our service to customers. I do not know the nature of your complaint, and this is why I have a couple of questions. How do you feel about our service? When was the last time you used our service? Well, based on your answers, it sounds like we can learn a lot from you if we were to talk in more detail. Are you available to put a brief 15 to 20 minute meeting on the calendar where we can discuss this in more detail and share any insight and value you may have to offer?","queue_name":"ZVRSComplaintsQueue","date":"2016-04-01T00:00:00.000Z"}]}`

* **Error Response:**
  * **Code:** 400 BAD REQUEST, **Content:** `{'message': 'missing type field'}`
  * **Code:** 400 BAD REQUEST, **Content:** `{'message': 'missing queue_name field'}`
  * **Code:** 404 NOT FOUND, **Content:** `{'message': 'script not found'}`
  * **Code:** 500 INTERNAL SERVER ERROR, **Content:** `{'message': 'mysql error'}`
  * **Code:** 501 NOT IMPLEMENTED, **Content:** `{'message': 'records returned is not 1'}`

* **Sample Call:**

  http://*hostname:port*/getscript/?type=GeneralComplaint&queue_name=ComplaintsQueue

* **Notes:**

  _None._

 ----
 ##updateProfile

_Update an agent profile record in the agent database._

  * **URL**

    _/updateProfile_

  * **Method:**

     `POST`

  *  **URL Params**

     **Required:**

     _None._

     **Optional:**

     _None._

  * **Data Params**
  Must input a value for each field of the fields shown below.
  `{
  "agent_id":25,
  "first_name": "Marie",
  "last_name": "C.",
  "role": "Manager",
  "phone": "444-444-4444",
  "email": "administrator@portal.com",
  "organization": "Organization Zulu",
  "is_approved": 0,
  "is_active": 0
  }`


  * **Success Response:**

    * **Code:** 200, **Content:** `{'message':'success'}`

  * **Error Response:**
    * **Code:** 400 BAD REQUEST, **Content:** `{'message':'Missing required field(s)'}`
    * **Code:** 500 INTERNAL SERVER ERROR, **Content:** `{'message': 'mysql error'}`

  * **Sample Call:**

 * curl -H "Content-Type: application/json" -X POST -d '{"agent_id":25, "first_name": "Marie", "last_name": "C.", "role": "Manager", "phone": "444-444-4444", "email": "administrator@portal.com", "organization": "Organization Zulu", "is_approved": 0, "is_active": 0 }' http://*hostname:port*/updateProfile

  * **Notes:**

    _None._
