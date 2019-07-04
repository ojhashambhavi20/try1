const smpp = require('smpp');
const session = new smpp.Session({host: '137.117.37.106', port: 4000});
let isConnected = false
session.on('connect', () => {
  isConnected = true;
  console.log("conected");

  session.bind_transceiver({
      system_id: '',
      password: 'USER_PASSWORD',
      interface_version: 1,
      system_type: '380666000600',
      address_range: '+380666000600',
      addr_ton: 1,
      addr_npi: 1,
  }, (pdu) => {
    if (pdu.command_status == 0) {
        console.log('Successfully bound')
    }

  })
})
session.on('close', () => {
  console.log('smpp is now disconnected') 
   
  if (isConnected) {        
    session.connect();    //reconnect again
  }
})
session.on('error', error => { 
  console.log('smpp error', error)   
  isConnected = false;
});
function sendSMS(from, to, text) {
   from = +918512081045 
// this is very important so make sure you have included + sign before ISD code to send sms
   to = +917240265966
  
  session.submit_sm({
      source_addr:from,
      destination_addr:to,
      short_message:"hi"
  }, function(pdu) {
      if (pdu.command_status == 0) {
          // Message successfully sent
          console.log(pdu.message_id);
      }
  });
}