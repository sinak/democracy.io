var bcrypt = require('bcrypt');
var randomstring = require('randomstring');

var salt = bcrypt.genSaltSync(10);
console.log('salt: ' + salt);


var secret = randomstring.generate(30);
console.log('secret: ' + secret);
