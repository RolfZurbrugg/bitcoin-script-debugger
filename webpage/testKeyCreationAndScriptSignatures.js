var bitcore = require('bitcore-lib');
var Mnemonic = require('bitcore-mnemonic');



var privateKey = new bitcore.PrivateKey();
var publicKey = new bitcore.PublicKey.fromPrivateKey(privateKey);
var address = publicKey.toAddress();

console.log('Private Key: '+privateKey.toString());
console.log('Public Key: '+publicKey);
console.log('Adress : '+address);



// building transaction chain on blocks, hope this works

//creating a javascript block

//genesis block hex string

var genesisBlockHexString =
    "01000000" + //version
    "0000000000000000000000000000000000000000000000000000000000000000" + // prev block
    "3ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4a" + // merkle root
    "29ab5f49" + // timestamp
    "ffff001d" + //bits
    "1dac2b7c" + //nonce
    "01000000" + // version
    "01" + // number of transactions
    "01" + // inputs
    "0000000000000000000000000000000000000000000000000000000000000000" + // prev output
    "ffffffff" + // sequence
    "4d" + //script length
    "04ffff001d0104455468652054696d65732030332f4a616e2f32303039204368616e63656c6c6f72206f6e206272696e6b206f66207365636f6e64206261696c6f757420666f722062616e6b73" + //scriptsig
    "ffffffff" + //sequence
    "01" + //outputs
    "00f2052a01000000" + //50 BTC
    "43" + // pk_script length
    "4104678afdb0fe5548271967f1a67130b7105cd6a828e03909a67962e0ea1f61deb649f6bc3f4cef38c4f35504e51ec112de5c384df7ba0b8d578a4c702b6bf11d5fac" + //pk script
    "00000000"; //lock time


var genesisBlockJSON = {
    "hash":"000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
    "ver":1,
    "prev_block":"0000000000000000000000000000000000000000000000000000000000000000",
    "mrkl_root":"4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b",
    "time":1231006505,
    "bits":486604799,
    "nonce":2083236893,
    "n_tx":1,
    "size":285,
    "tx":[
        {
            "hash":"4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b",
            "ver":1,
            "vin_sz":1,
            "vout_sz":1,
            "lock_time":0,
            "size":204,
            "in":[
                {
                    "prev_out":{
                        "hash":"0000000000000000000000000000000000000000000000000000000000000000",
                        "n":4294967295
                    },
                    "coinbase":"04ffff001d0104455468652054696d65732030332f4a616e2f32303039204368616e63656c6c6f72206f6e206272696e6b206f66207365636f6e64206261696c6f757420666f722062616e6b73"
                }
            ],
            "out":[
                {
                    "value":"50.00000000",
                    "scriptPubKey":"04678afdb0fe5548271967f1a67130b7105cd6a828e03909a67962e0ea1f61deb649f6bc3f4cef38c4f35504e51ec112de5c384df7ba0b8d578a4c702b6bf11d5f OP_CHECKSIG"
                }
            ]
        }
    ],
    "mrkl_tree":[
        "4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b"
    ]
};

//var genesisBlockJSObj = JSON.parse(genesisBlockJSON);
var genesisBlockBuffer = bitcore.util.buffer.hexToBuffer(genesisBlockHexString);
var genesisBlock = bitcore.Block(genesisBlockBuffer);

//var genesisBlock = bitcore.Block.fromString(genesisBlockHexString);

console.log(genesisBlock);




// create an unspent transaction

var data = new Object(); // creating the data opbject to create an unspent tx
data.txid =''; // {String} the previous transaction id
data.txId = ''; // {String=} alias for 'txid'
data.vout = 0; // {number} the index in the transaction
data.outputIndex = 0; // {number=} alias for 'vout'
data.scriptPubKey = ''; // {string|Script} the script that must be resolved to release the funds
data.script = ''; // {string|Script=} alias for 'scriptPubKey'
data.amount = 1; // {number} amount of bitcoins associated
data.satoshis =100000000; // {number=} alias for 'amount', but expressed in satoshis (1 BTC = 1e8 satoshis
data.address = '' // {sting | Address=} the associated address to the script, if provided.




