const SMS = require('node-sms-send')
 console.log("1");
const sms = new SMS('', '')
  console.log("2");
sms.send('+918512081045', 'Hello!')
  .then(body => console.log(body)) // returns { message_id: 'string' }
  .catch(err => console.log(err.message))
   console.log("3");