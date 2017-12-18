var bitcore = require('bitcore-lib');
var Mnemonic = require('bitcore-mnemonic');



var privateKey = new bitcore.PrivateKey();
var publicKey = new bitcore.PublicKey.fromPrivateKey(privateKey);
var address = publicKey.toAddress();

var privateKey2 = new bitcore.PrivateKey();
var publicKey2 = new bitcore.PublicKey.fromPrivateKey(privateKey2);
var changeAddress = publicKey2.toAddress();

console.log('Private Key: '+privateKey.toString());
console.log('Public Key: '+publicKey);
console.log('Adress : '+address);



//  building transaction chain on blocks, hope this works
//
// //creating a javascript block
//
// //genesis block hex string
//
// var genesisBlockHexString =
//     "01000000" + //version
//     "0000000000000000000000000000000000000000000000000000000000000000" + // prev block
//     "3ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4a" + // merkle root
//     "29ab5f49" + // timestamp
//     "ffff001d" + //bits
//     "1dac2b7c" + //nonce
//     "01000000" + // version
//     "01" + // number of transactions
//     "01" + // inputs
//     "0000000000000000000000000000000000000000000000000000000000000000" + // prev output
//     "ffffffff" + // sequence
//     "4d" + //script length
//     "04ffff001d0104455468652054696d65732030332f4a616e2f32303039204368616e63656c6c6f72206f6e206272696e6b206f66207365636f6e64206261696c6f757420666f722062616e6b73" + //scriptsig
//     "ffffffff" + //sequence
//     "01" + //outputs
//     "00f2052a01000000" + //50 BTC
//     "43" + // pk_script length
//     "4104678afdb0fe5548271967f1a67130b7105cd6a828e03909a67962e0ea1f61deb649f6bc3f4cef38c4f35504e51ec112de5c384df7ba0b8d578a4c702b6bf11d5fac" + //pk script
//     "00000000"; //lock time
//
//
// var genesisBlockJSON = {
//     "hash":"000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
//     "ver":1,
//     "prev_block":"0000000000000000000000000000000000000000000000000000000000000000",
//     "mrkl_root":"4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b",
//     "time":1231006505,
//     "bits":486604799,
//     "nonce":2083236893,
//     "n_tx":1,
//     "size":285,
//     "tx":[
//         {
//             "hash":"4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b",
//             "ver":1,
//             "vin_sz":1,
//             "vout_sz":1,
//             "lock_time":0,
//             "size":204,
//             "in":[
//                 {
//                     "prev_out":{
//                         "hash":"0000000000000000000000000000000000000000000000000000000000000000",
//                         "n":4294967295
//                     },
//                     "coinbase":"04ffff001d0104455468652054696d65732030332f4a616e2f32303039204368616e63656c6c6f72206f6e206272696e6b206f66207365636f6e64206261696c6f757420666f722062616e6b73"
//                 }
//             ],
//             "out":[
//                 {
//                     "value":"50.00000000",
//                     "scriptPubKey":"04678afdb0fe5548271967f1a67130b7105cd6a828e03909a67962e0ea1f61deb649f6bc3f4cef38c4f35504e51ec112de5c384df7ba0b8d578a4c702b6bf11d5f OP_CHECKSIG"
//                 }
//             ]
//         }
//     ],
//     "mrkl_tree":[
//         "4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b"
//     ]
// };
//
// //var genesisBlockJSObj = JSON.parse(genesisBlockJSON);
// var genesisBlockBuffer = bitcore.util.buffer.hexToBuffer(genesisBlockHexString);
// var genesisBlock = bitcore.Block(genesisBlockBuffer);
//
// //var genesisBlock = bitcore.Block.fromString(genesisBlockHexString);
//
// console.log(genesisBlock);




// // create an unspent transaction (utox)
//
// var data = new Object(); // creating the data opbject to create an unspent tx
// data.txid ='00baf6626abc2df808da36a518c69f09b0d2ed0a79421ccfde4f559d2e42128b'; // {String} the previous transaction id
// data.txId = ''; // {String=} alias for 'txid'
// data.vout = 0; // {number} the index in the transaction
// data.outputIndex = 0; // {number=} alias for 'vout'
// data.scriptPubKey = ''; // {string|Script} the script that must be resolved to release the funds
// data.script = ''; // {string|Script=} alias for 'scriptPubKey' (Output Script)
// data.amount = 1; // {number} amount of bitcoins associated
// data.satoshis =100000000; // {number=} alias for 'amount', but expressed in satoshis (1 BTC = 1e8 satoshis
// data.address = ''; // {sting | Address=} the associated address to the script, if provided.
//
//
// var unspentOutput = bitcore.Transaction.UnspentOutput(data);
//
// console.log(unspentOutput);
//
//
// // lets now try and make a transaction bassed on the utox created above.
// var tx = bitcore.Transaction().from(unspentOutput, publicKey);
//
// console.log(tx); //ok this sorta works i think were getting some where :)

// now to make this usefull lets put it in functions

// function to crate a utox

function crateUtox(outputScript, toAddress){

    //creating the data object in order to be able to create a utox
    var data = new Object(); // creating the data opbject to create an unspent tx
    data.txid ='00baf6626abc2df808da36a518c69f09b0d2ed0a79421ccfde4f559d2e42128b'; // {String} the previous transaction id
    //data.txId = '00baf6626abc2df808da36a518c69f09b0d2ed0a79421ccfde4f559d2e42128b'; // {String=} alias for 'txid'
    //data.vout = 0; // {number} the index in the transaction
    data.outputIndex = 0; // {number=} alias for 'vout'
    //data.scriptPubKey = outputScript; // {string|Script} the script that must be resolved to release the funds
    data.script = outputScript; // {string|Script=} alias for 'scriptPubKey' (Output Script)
    //data.amount = 1; // {number} amount of bitcoins associated
    data.satoshis =100000000; // {number=} alias for 'amount', but expressed in satoshis (1 BTC = 1e8 satoshis)
    //data.address = toAddress; // {sting | Address=} the associated address to the script, if provided.

    var utox = bitcore.Transaction.UnspentOutput(data);
    return utox;
}


/*  pay to pubkey script format for reference
 *  scriptPubKey: <pubKey> OP_CHECKSIG
 *  scriptSig: <sig>
 */

var outputScript = new bitcore.Script();
outputScript.add(publicKey.toBuffer())
            .add(bitcore.Opcode.OP_CHECKSIG);

console.log('OutputScrip:\n'+outputScript);

//verified that the above method is equvelant to my manual method
//outputscript using script builder
// var outputScriptFromScriptBuilder = bitcore.Script.buildPublicKeyOut(publicKey);
// console.log('Outputscript from scriptbuilder: '+ outputScriptFromScriptBuilder);


var utox = crateUtox(outputScript, address);

// creating a JS object of a transaction

// var txObject = {
//     'adress' : address,
//     'txID' : '00baf6626abc2df808da36a518c69f09b0d2ed0a79421ccfde4f559d2e42128c',
//     'outputIndex' : 0,
//     'script' : bitcore.Script.empty(),
//     'satoshis' : 100000000
// };
//
// var transx = bitcore.Transaction().fromObject(txObject);
//
// console.log(transx);
//
// var tx3 = new bitcore.Transaction();
//
// console.log(tx3);
//
// var sig = tx3.sign(privateKey);
//
// console.log('sig:\n'+sig.toString());

// atempt 2 at creating a transaction object
// first we create an input object
// var inputObj = new Object();
// inputObj.output = ''; // params.output not sure what goes here
// inputObj.prevTxId = '0000000000000000000000000000000000000000000000000000000000000000'; //lets pretend there was no previous tx
// inputObj.outputIndex = ''; //params.outputIndex
// inputObj.sequenceNumber = "ffffffff"; // not sure what exactly is requiered here, stole sequence from genesis block.
// inputObj.script = outputScript;
//
// var input = bitcore.Transaction.Input.fromObject(inputObj);
// console.log('Input:\n'+input);


// attempt 3 at building a tx
var tx3 =  bitcore.Transaction()
    .from(utox,publicKey)
    .to(address, 100000000) // this has something to do with the tx3.outputs[0] this automaticaly gives me a pay to pubkey output script i think
    .change(changeAddress);

tx3.sign(privateKey, 1); // default is SIGHASH_ALL, other options include bitcore.Transaction.SIGHASH_NONE =1

// //trying to extract the signature
// var sigArr = tx3.getSignatures(privateKey,1);
// var sig = sigArr[0].signature;
// console.log('sig arr :');
// console.log(sigArr);
// console.log(sig);
//
// // build a script using buildpublicKeyIn
// var signedScriptFromBuilder = bitcore.Script.buildPublicKeyIn(sig,1);
// console.log(signedScriptFromBuilder.toString());

console.log('Transaction tx3: \n');
console.log(tx3);
console.log('input script with sig');
var tx3ScriptWithSig = bitcore.Script(tx3.inputs[0]._script);
console.log(tx3ScriptWithSig.toString());

// console.log('TX 3 get signature: \n');   // the signatures match even when signing a second time. Sining a tx causes the signature to be removed.
// var sigArr = tx3.getSignatures(privateKey);
// console.log(sigArr[0].signature.toString());


// var tx =  bitcore.Transaction().from(utox,publicKey);
// tx.to(address, 1000); // defining to which address satoshies will be sent.
// console.log('Transactiong tx:');
// console.log(tx);


// var sig = tx3.getSignatures(privateKey, bitcore.Transaction.SIGHASH_NONE); //here we create the signature,
//
// tx3.applySignature(sig[0]); //here we have to apply the signature to the tx for some reason this is not doing anything
// console.log('tx3 after sig is applied');
// console.log(tx3);
//
// console.log('sig: ');
// console.log(sig[0]); // for some reason r and s of the signature object are empty. i dont know where they come from.
// console.log('sig to string: ');
//console.log(sig[0].toString());

// console.log(tx3.isFullySigned());
// console.log(tx3.isValidSignature(sig));


// to spend the transaction i need a new transaction which will the satoshies i recieved from tx3
console.log('input script with sig');
var tx3ScriptWithSig = bitcore.Script(tx3.inputs[0]._script);
console.log(tx3ScriptWithSig);

console.log('signature');
var sigArr = tx3.getSignatures(privateKey,1);
console.log(sigArr[0]);
var scriptSig = bitcore.Script.buildPublicKeyIn(sigArr[0].signature.toDER(),1);
console.log('script sig\n'+scriptSig);

console.log('output scripts of tx3');
// var tx3InputScript = bitcore.Script(tx3.outputs[0]._script);
// console.log(tx3InputScript.toString()); // why am i getting a pay to pubkey hash script here OP_DUP OP_HASH160 <pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG
var tx3OutputScript = bitcore.Script(tx3.inputs[0].output._script);// expected op codes 33 (bites to be pushed onto stack), 172 OP_CHECKSIG
console.log(tx3OutputScript.toString());


//
// var inputscript = new bitcore.Script();
//
//
// console.log('Inputscript:\n');
// console.log(inputscript);

//nin - index of the transaction input containing the scriptSig verified.
var nin = 0;
var result = bitcore.Script.Interpreter().verify(tx3ScriptWithSig,outputScript,tx3); //this is correct , scripts are correct, problem could be in the interpreter. .... lets debug to find out


console.log('result test: '+result);


// // from interpreter ln 1114 op_checksig
// var verify = tx3.verify();
// console.log(verify);


// var txOP_RETURN = new bitcore.Transaction()
//     .from(utox)
//     .addData('bitcoin rocks')
//     .sign(privateKey);
//
// console.log('txOP_RETURNS');
// console.log(txOP_RETURN);

//
// //testing arrays in javascript
//
// var testArr = new Array();
//
// for (var i=0; i<10;i++){
//     testArr[i] = new Array();
//
//     for (var j=0; j<10;j++){
//         testArr[i][j]= j;
//     }
// }


var hash = bitcore.crypto.Hash.sha1(publicKey.toBuffer());

console.log(hash);

var hashStr = bitcore.crypto.BN.fromScriptNumBuffer(hash, true, hash.length);
console.log(hash.toString('hex'));

var hashScript = bitcore.Script().add(hash);
console.log(hashScript.toString());


console.log('is script standard?: '+ outputScript.isStandard());

