var bitcore = require('bitcore-lib');


console.log('app.js ready');

//constants needed for accessing the generated keys in the script parsing
var PRIVATE_KEY = 1;
var PUBLIC_KEY = 2;
var ADDRESS   = 3;
var signed = false;
P$.initVariableMap();


/**
 * This function takes the input and output script with id 'is', 'os' respectivly
 * and evaluates the script
 * @param form
 */
function runScript(form) {

    // window.stackArray = new Array(); // this step is necessary in order to remove results form the array from previous calls.

    clearStack();

    var input_script_string = getInputScript();
    var output_script_string = getOutputScript();

    // var script_i = getInputScript();
    // var script_o = getOutputScript();


    //var result = bitcore.Script.Interpreter().verify(script_i, script_o);
   // window.resetCount();

    var stackArray = bitcore.Script.Interpreter.prototype.debug(input_script_string, output_script_string, getSelectedPrivateKey(), signed);
    console.log(stackArray);

   // window.stack_trace += '\n' + 'Result: ' + result;

    $('#stt').val(window.stack_trace);
}

function getSelectedPrivateKey() {
    //todo implement drop down, that alows for key selection
    var privK_n = $('#privateKeySelection').val();
    return P$.getValueByKey(privK_n);
}

/**
 *
 */
function sign() {
    signed = true;
    console.log(signed);

    // This is no longer neccessary
    // var inputScriptString = getInputScript();
    // if(inputScriptString === ''){ //if the inputscript is empty the key word sig can be on the first line
    //     inputScriptString += 'sig';
    // }else{ //if the inputscript is not empty the sig key word should be appended on a new line for visual pleasure.
    //     inputScriptString += '\nsig';
    // }
    // setInputScript(inputScriptString);
}

/**
 * Functions for accessing the input and output script text boxes.
 */

function getInputScript(){
    var input_script_string = $("#is").val();
    return input_script_string;
}

function getOutputScript(){
    var output_script_string = $("#os").val();
    return output_script_string;
}

function setInputScript(scriptString){
    $('#is').val(scriptString);
}

function setOutPutScript(scriptString) {
    $('#os').val(scriptString);
}

/**
 * This function was implemented because there is no way to clear textareas on refresh
 * so a manual option is provided to clear the current stack trace
 * @param form
 */
function clearStack() {
    $('#stt').val('');
    window.stack_trace = '';
}


function getSigType() {
    var sigType = $('#sigType').val();
    P$.addKeyValuePair('selectedSigType',P$.getValueByKey(sigType));
}



/**
 * todo this needs refactoring
 * creating a dynamic table in order to store public and private key pairs and their corresponding address
 * @type {number}
 */
//create dynamic table for keypairs and addresses
//addapted implementation from http://www.encodedna.com/javascript/dynamically-add-remove-rows-to-html-table-using-javascript-and-save-data.htm


// ARRAY FOR HEADER.
var createdAdressId = 1;
var arrHead = new Array();
arrHead = ['ID', 'Private Key', 'Public Key', 'Address', ''];      // SIMPLY ADD OR REMOVE VALUES IN THE ARRAY FOR TABLE HEADERS.

// FIRST CREATE A TABLE STRUCTURE BY ADDING A FEW HEADERS AND
// ADD THE TABLE TO YOUR WEB PAGE.
function createTable() {
    var empTable = document.createElement('table');
    empTable.setAttribute('id', 'empTable');            // SET THE TABLE ID.

    var tr = empTable.insertRow(-1);

    for (var h = 0; h < arrHead.length; h++) {
        var th = document.createElement('th');          // TABLE HEADER.
        th.innerHTML = arrHead[h];
        tr.appendChild(th);
    }

    var div = document.getElementById('cont');
    div.appendChild(empTable);    // ADD THE TABLE TO YOUR WEB PAGE.
}

// ADD A NEW ROW TO THE TABLE.s
function addRow() {
    var empTab = document.getElementById('empTable');

    var rowCnt = empTab.rows.length;        // GET TABLE ROW COUNT.
    var tr = empTab.insertRow(rowCnt);      // TABLE ROW.
    tr = empTab.insertRow(rowCnt);


    //create a key pair and address
    var privateKey = new bitcore.PrivateKey();
    var publicKey = new bitcore.PublicKey.fromPrivateKey(privateKey);
    var address = publicKey.toAddress();


    for (var c = 0; c < arrHead.length; c++) {
        var td = document.createElement('td');          // TABLE DEFINITION.
        td = tr.insertCell(c);

        if (c == 0) {
            addTextBox(document, td, createdAdressId);
        }

        if (c == 1) {
            var privKeyName = 'privK_' + createdAdressId;
            addTextBox(document, td, privateKey.toString());
            P$.addKeyValuePair(privKeyName, privateKey);
            addPrivateKeyToDropDown(privKeyName);
            addVariableToHashCreateDropDown(privKeyName);
        }

        if (c == 2) {
            var pubKeyName = 'pubK_' + createdAdressId;
            addTextBox(document, td, publicKey.toString());
            P$.addKeyValuePair(pubKeyName, publicKey);
            addVariableToHashCreateDropDown(pubKeyName);
        }

        if (c == 3) {
            addTextBox(document, td, address);
            P$.addKeyValuePair('addr_' + createdAdressId, publicKey);
        }

        if (c == 4) {           // FIRST COLUMN.
                                // ADD A BUTTON.
            var button = document.createElement('input');

            // SET INPUT ATTRIBUTE.
            button.setAttribute('type', 'button');
            button.setAttribute('value', 'Remove');

            // ADD THE BUTTON's 'onclick' EVENT.
            button.setAttribute('onclick', 'removeRow(this)');

            td.appendChild(button);

            //ToDo remove key pairs and address from Variable Map
        }
        else { //todo why does this case occour?

        }
    }
    createdAdressId++;
}

//create and add textbox and set value
function addTextBox(document, td, value) {
    // CREATE AND ADD TEXTBOX IN EACH CELL.
    var ele = document.createElement('input');
    ele.setAttribute('type', 'text');
    ele.setAttribute('value', value);
    ele.setAttribute('readonly', true);

    td.appendChild(ele);
}

// DELETE TABLE ROW.
function removeRow(oButton) {
    var empTab = document.getElementById('empTable');
    empTab.deleteRow(oButton.parentNode.parentNode.rowIndex);       // BUTTON -> TD -> TR.
}

// Access table by row and columns
function getTableValue(row, columns) {
    var myTab = document.getElementById('empTable');
    var element = myTab.rows.item(row).cells[columns];

    return element.childNodes[0].value;
}


// ToDo not sure if this is needed
// EXTRACT AND SUBMIT TABLE DATA.
function sumbit() {
    var myTab = document.getElementById('empTable');
    var values = new Array();

    // LOOP THROUGH EACH ROW OF THE TABLE.
    for (row = 1; row < myTab.rows.length - 1; row++) {
        for (c = 0; c < myTab.rows[row].cells.length; c++) {   // EACH CELL IN A ROW.

            var element = myTab.rows.item(row).cells[c];
            if (element.childNodes[0].getAttribute('type') == 'text') {
                values.push("'" + element.childNodes[0].value + "'");
            }
        }
    }
    console.log(values);
}

/**
 * ToDo find a better option than after private keys are currently displayed in the wrong order.
 * @param privateKeyVariable
 */
function addPrivateKeyToDropDown(privateKeyVariable){
    var selectHTML='';

    selectHTML += '\n'+'<option value="'+privateKeyVariable+'">'+privateKeyVariable+'</option>';
    $('#keySelectionElement0').after(selectHTML);
}

function addVariableToHashCreateDropDown(publicKeyVariable) {
    var selectHTML='';

    selectHTML += '\n'+'<option value="'+publicKeyVariable+'">'+publicKeyVariable+'</option>';
    $('#selectionPubKeyElement0').after(selectHTML);
}

/**
 *
 * @param num
 * @returns {*}
 */
function getPubKeyFromTable(num){
    var pubKeyString = getTableValue(num, PUBLIC_KEY); //getting the public key string out of the dynamic table
    var pubKey = new bitcore.PublicKey(pubKeyString);
    return pubKey;
}

/**
 *
 * @param num
 * @returns {*}
 */
function getPrivatKeyFromTable(num){
    var privateKeyString = getTableValue(num, PRIVATE_KEY);
    var privateKey = new bitcore.PrivateKey(privateKeyString);
    return privateKey;
}

/**
 *
 */
function loadBaiscDemoScript(){
    var inputScriptString =     'OP_1\n' +
                                'OP_1\n' +
                                'OP_ADD';

    var outputScriptString =    'OP_2\n' +
                                'OP_EQUAL';

    setInputScript(inputScriptString);
    setOutPutScript(outputScriptString);
}

/**
 *
 */
function loadP2PKDemoScript() {
    var inputScriptString =     'sig';

    var outputScriptString =    'pubK_0\n' +
                                'OP_CHECKSIG';

    setInputScript(inputScriptString);
    setOutPutScript(outputScriptString);
}


/**
 *
 */
function loadP2PHDemoScript() {
    var inputScriptString =     'sig\n' +
                                'pubK_0';

    var outputScriptString =    'OP_DUP\n' +
                                'OP_HASH160\n' +
                                'pubKHash_0\n' +
                                'OP_EQUALVERIFY\n' +
                                'OP_CHECKSIG';

    setInputScript(inputScriptString);
    setOutPutScript(outputScriptString);
}


/**
 * table for hashes
 *
 */

// ARRAY FOR HEADER.
var createdHashId = 1;
var hashTableHead = new Array();
hashTableHead = ['ID', 'Publik Key', 'Hash', 'Type', ''];      // SIMPLY ADD OR REMOVE VALUES IN THE ARRAY FOR TABLE HEADERS.

// FIRST CREATE A TABLE STRUCTURE BY ADDING A FEW HEADERS AND
// ADD THE TABLE TO YOUR WEB PAGE.
function createHashTable() {
    var empHashTable = document.createElement('table');
    empHashTable.setAttribute('id', 'empHashTable');            // SET THE TABLE ID.

    var tr = empHashTable.insertRow(-1);

    for (var h = 0; h < hashTableHead.length; h++) {
        var th = document.createElement('th');          // TABLE HEADER.
        th.innerHTML = hashTableHead[h];
        tr.appendChild(th);
    }

    var div = document.getElementById('contHashTable');
    div.appendChild(empHashTable);    // ADD THE TABLE TO YOUR WEB PAGE.
}

// ADD A NEW ROW TO THE TABLE.s
function hashTableAddRow() {
    var empTab = document.getElementById('empHashTable');

    var rowCnt = empTab.rows.length;        // GET TABLE ROW COUNT.
    var tr = empTab.insertRow(rowCnt);      // TABLE ROW.
    tr = empTab.insertRow(rowCnt);


    // get selected pubKey
    var selectedPubKey = $('#selectPubKeyForHash').val();
    var pubKey = P$.getValueByKey(selectedPubKey);

    // get selected hash function
    var selectedHashFunction = $('#selectHashFunktion').val();



    for (var c = 0; c < hashTableHead.length; c++) {
        var td = document.createElement('td');          // TABLE DEFINITION.
        td = tr.insertCell(c);

        if (c == 0) {
            addTextBox(document, td, createdHashId);
        }

        if (c == 1) {
            var pubKeyHashName = 'pubKHash_' + createdHashId;
            var pubKeyHash = createPubKeyHash(pubKey, selectedHashFunction);
            P$.addKeyValuePair(pubKeyHashName, pubKeyHash);
            addTextBox(document, td, pubKey.toString());
        }

        if (c == 2) {
            var pubKeyHashName = 'pubKHash_' + createdHashId;
            var pubKeyHash = P$.getValueByKey(pubKeyHashName);
            addTextBox(document, td, pubKeyHash.toString('hex'));
        }

        if (c == 3) {
            addTextBox(document, td, selectedHashFunction);

        }

        if (c == 4) {           // FIRST COLUMN.
            // ADD A BUTTON.
            var button = document.createElement('input');

            // SET INPUT ATTRIBUTE.
            button.setAttribute('type', 'button');
            button.setAttribute('value', 'Remove');

            // ADD THE BUTTON's 'onclick' EVENT.
            button.setAttribute('onclick', 'removeRowPubKeyHashTable(this)');

            td.appendChild(button);

            //ToDo remove key pairs and address from Variable Map
        }
        else { //todo why does this case occour?

        }
    }
    createdHashId++;
}

// DELETE TABLE ROW.
function removeRowPubKeyHashTable(oButton) {
    var empTab = document.getElementById('empHashTable');
    empTab.deleteRow(oButton.parentNode.parentNode.rowIndex);       // BUTTON -> TD -> TR.
}

function createPubKeyHash (pubKey, hashType){

    var pubKeyHash = null;

    switch (hashType){
        case 'sha1' :
            pubKeyHash= bitcore.crypto.Hash.sha1(pubKey.toBuffer());
            break;

        case 'sha256' :
            pubKeyHash= bitcore.crypto.Hash.sha256(pubKey.toBuffer());
            break;

        case 'sha256sha256' :
            pubKeyHash= bitcore.crypto.Hash.sha256sha256(pubKey.toBuffer());
            break;

        case 'ripemd160' :
            pubKeyHash= bitcore.crypto.Hash.ripemd160(pubKey.toBuffer());
            break;

        case 'sha256ripemd160' :
            pubKeyHash= bitcore.crypto.Hash.sha256ripemd160(pubKey.toBuffer());
            break;

        case 'sha512' :
            pubKeyHash= bitcore.crypto.Hash.sha512(pubKey.toBuffer());
            break;

        case 'sha512' :
            pubKeyHash= bitcore.crypto.Hash.sha512(pubKey.toBuffer());
            break;

        case 'hmac' :
            pubKeyHash= bitcore.crypto.Hash.hmac(pubKey.toBuffer()); //todo takes other arguments
            break;

        case 'sha256hmac' :
            pubKeyHash= bitcore.crypto.Hash.sha256hmac(pubKey.toBuffer()); //todo takes other arguments
            break;

        case 'sha512hmac' :
            pubKeyHash= bitcore.crypto.Hash.sha512hmac(pubKey.toBuffer()); //todo takes other arguments
            break;
    }

    return pubKeyHash;
}

function initTables(){
    createTable();
    createHashTable();

}