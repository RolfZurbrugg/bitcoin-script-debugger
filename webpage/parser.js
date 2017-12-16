/**
 * The parser takes a string containing opcodes which are either separated by white spaces or
 * carriage return. It will return a bitcore script object containing the script.
 *
 * ToDo extend this library to be able to do syntax checks
 */

var bitcore = require('bitcore-lib');


(function (global) {
    
    var Parser = function (script_text) {
        return new Parser.init(script_text);
    }


    //todo extend the parser to be able to handle variables. This could maby be done using a map of all the variables.
    Parser.init = function (script_text) {

        var opcode_arr = script_text.split(/\s+|\r+/);

        var script = bitcore.Script();

        if(script_text === ''){ //if a script is empty return a empty script
            return script;
        }

        for(var i=0; i<opcode_arr.length; i++){
            // if a value in the opcode_arr corresponds to a variable -> replace variable
            if (/(privK_\n*)/.test(opcode_arr[i])   || //test for private key variable
                /(pubK_\n*)/.test(opcode_arr[i])    || //test for publik key varible
                /(addr_\n*)/.test(opcode_arr[i])){     //test for address


                var variable = P$.getValueByKey(opcode_arr[i]); //ToDo find a better name instead of variable
                script.add(variable.toBuffer());

            }else if (/(sig)/.test(opcode_arr[i])){ //test for signature
                //do nothing, because the signature ist appended to the script automatically after a transaction is signed.
            }
            else {
                script.add(opcode_arr[i]);
            }
        }

        console.log(script);
        return script;


    }

    /**
     * methods for interaction with the variableMap
      */

    /**
     * given a key returns the corresponding value
     * @param key {string}
     * @returns {*}
     */
    Parser.__proto__.getValueByKey = function(key){
        return Parser.prototype.variableMap[key];
    };

    /**
     * Initialize variable map with some default values
     * todo this map should be created on load.
     */
    Parser.__proto__.initVariableMap = function () {
        Parser.prototype.variableMap = {
            SIGHASH_ALL:    bitcore.crypto.Signature.SIGHASH_ALL,
            SIGHASH_NONE:   bitcore.crypto.Signature.SIGHASH_NONE,
            SIGHASH_SINGLE: bitcore.crypto.Signature.SIGHASH_SINGLE,
            SIGHASH_ANYONECANPAY: bitcore.crypto.Signature.SIGHASH_ANYONECANPAY
        }
    };

    /**
     * returns the variableMap
     * @returns {{}}
     */
    Parser.__proto__.getVariableMap = function () {
      return Parser.prototype.variableMap;
    };

    /**
     * this function removes all set key value pairs from the map.
     */
    Parser.__proto__.clearMap = function() {
       initVariableMap();
    };

    /**
     * allow the dynamic addition of key value pairs
     * @param key {string}
     * @param value {object}
     */
    Parser.__proto__.addKeyValuePair = function(key, value){
        Parser.prototype.variableMap[key] = value;
    };

    /**
     * deletes the key value pair for a given key
     * @param key {string}
     */
    Parser.__proto__.deleteKeyValuePair = function (key) {
        delete Parser.prototype.variableMap[key];
    };


    Parser.init.prototype = Parser.prototype;

    global.Parser = global.P$ = Parser;


}(window));

//todo not sure if this belongs inside the parser function.

/**
 * The map that is created here will be added to the Parses.prototype object.
 * The parser proveides folowing methods for interaction with the map:
 *      getValueByKey
 *      getVariableMap
 *      clearMap
 *      addKeyValuePair
 *      deleteKeyValuePair
 *
 * public keys will be denoted as <pubKey_n> where n is a the corresponding number.
 * private keys will be denoted as <privKey_n>
 * adresses will be denoted as <addr_n>
 * signatures will be denoted as <sig> . no number is needed here because currently only one signature is suported. This might need to be expanded.
 * @type {{}}
 */
Parser.prototype.variableMap = {};