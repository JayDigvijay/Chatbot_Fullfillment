// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues

const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'ws://calculator-a001e.firebaseio.com/',
});


process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
  function dayschedule(agent) {
 	const weekday = agent.parameters.weekday; 
    //agent.add(weekday);
    var start = 1;
    var i;
	if(weekday == 7)
  		agent.add(`No classes on your schedule. Enjoy!`);
	else
		agent.add(`Here is your schedule for the day-`);  
	return admin.database().ref('Class').once("value").then((snapshot) => {
  for(i = start; i <11; i++){
    
    		var key = weekday + "," + i;
    		var time = i+7;
    		var classtime = snapshot.child(key).val();
   		  agent.add(`At `+ time + `:00 hours, you have a ` + classtime);
  }
});
 }
                                                      
function rs(agent){
 var d = new Date();
    var day = d.getDay();
   	var hour = d.getHours(), min = d.getMinutes();
    if((min + 30) >= 60){
      hour ++;
    }
    min += 30;
    min %= 60;
    hour += 5;
    if(hour >= 24){
      day++;
    }
    hour %= 24;
  const t = 9; //Fill required time of the day in hours for testing.
  const dy = 3;// Fill required day of the week for testing. 0 = Sunday, 6 = Saturday 
  //day = dy;  // Uncomment for testing.
  //hour = t;
  var start = hour-6;
  var i;
if(hour > 17 || day == 7)
  agent.add(`No classes on your schedule. Enjoy!`);
else
agent.add(`Here is your schedule for the rest of the day-`);  
return admin.database().ref('Class').once("value").then((snapshot) => {
  for(i = start; i <11; i++){
    
    var key = day + "," + i;
    var time = i+7;
    var classtime = snapshot.child(key).val();
    agent.add(`At `+ time + `:00 hours, you have a ` + classtime);
   
  }
      
    });

}


//All the given functions are invoked using their names.
 
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('dayschedule', dayschedule);
  intentMap.set('rs', rs);
  agent.handleRequest(intentMap);
});
