var bitcore = require('bitcore-lib');


console.log('app.js ready');

/**
 * This function takes the input and output script with id 'is', 'os' respectivly
 * and evaluates the script
 * @param form
 */
function runScript(form) {

    window.stack_trace = ''; //reset, clear value which will be filled in bitcore-lib.js on line 6205 and 7092

    var input_script_string = $("#is").val();
    var output_script_string = $("#os").val();

    var script_i = P$(input_script_string);
    var script_o = P$(output_script_string);


    var result = bitcore.Script.Interpreter().verify(script_i, script_o);

    window.stack_trace += '\n' + 'Result: ' + result;

    $('#stt').val(window.stack_trace);
}

/**
 * This function was implemented because there is no way to clear textareas on refresh
 * so a manual option is provided to clear the current stack trace
 * @param form
 */
function clearStack(form) {
    $('#stt').val('');
}



//create dynamic table for keypairs and addresses
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
    var address =  publicKey.toAddress();


    for (var c = 0; c < arrHead.length; c++) {
        var td = document.createElement('td');          // TABLE DEFINITION.
        td = tr.insertCell(c);

        if (c == 0) {
           addTextBox(document, td, createdAdressId);
        }

        if (c == 1) {
            addTextBox(document, td, privateKey.toString());
        }

        if (c == 2) {
            addTextBox(document, td, publicKey.toString());
        }

        if (c == 3) {
            addTextBox(document, td, address);
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
        }
        else { //todo handle this properly
            console.log('this should never be the case');
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
