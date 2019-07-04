var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
	password='d6F3Efeq'
var textToChange="postgres://postgres:pwd123@localhost:5432/mini_project";

function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  return crypted;
}
console.log(encrypt(textToChange));