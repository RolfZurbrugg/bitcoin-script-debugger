var bitcore = require('bitcore-lib');
var Mnemonic = require('bitcore-mnemonic');



var privateKey = new bitcore.PrivateKey();
var publicKey = new bitcore.PublicKey.fromPrivateKey(privateKey);
var address = publicKey.toAddress();

console.log('Private Key: '+privateKey.toString());
console.log('Public Key: '+publicKey);
console.log('Adress : '+address);



