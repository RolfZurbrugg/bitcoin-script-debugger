var bitcore = require('bitcore-lib');

var _countStackArray = 0; // used to fill the Parser.prototype.stackArray properly

(function (interpreter) {

    /**
     * Executes both of the scripts by first concatenating them.
     * 
     * @param {String} inputScript The input script.
     * @param {String} outputScript The output script.
     * @returns {Array} An array of stacks. A Stack is created for each executed step.
     */
    bitcore.Script.Interpreter.prototype.debug = function (inputScriptString, outputScriptString) {

        // reset the count to fill the stack array
        Parser.prototype.resetCount();

        // initialize the stack array
        Parser.prototype.stackArray = new Array();

        // convert the input and output script strings to script objects
        var inputScript = P$(inputScriptString);
        var outputScript = P$(outputScriptString);

        // evaluate the scripts
        var nin = undefined;
        P$.resetScriptCount();
        var result = bitcore.Script.Interpreter().verify(inputScript, outputScript, P$.getValueByKey('tx'), nin, P$.getValueByKey('interpreterFlags'));
        P$.resetScriptCount();
        P$.addKeyValuePair('interpreterFlags', undefined);

        return Parser.prototype.stackArray;
    };

    // Extension of the bitcore step function 
    // to push the current stack onto the stack array in the parser.
    bitcore.Script.Interpreter.prototype.step = function () {
        var bool = interpreter.call(this);
        bitcore.Script.Interpreter.prototype.pushStack(this);

        return bool;
    };

    /**
     * Pushes the current stack onto the stack array in the parser.
     * 
     * @param _this
     */
    bitcore.Script.Interpreter.prototype.pushStack = function (_this) {
        here = Object.assign(this, _this);
        var fRequireMinimal = (here.flags & bitcore.Script.Interpreter.SCRIPT_VERIFY_MINIMALDATA) !== 0;

        // read instruction

        // the program counter needs to be decremented because the code from bitcore-lib has already advanced the counter
        var _pc = here.pc - 1;

        var chunk = here.script.chunks[_pc];
        var opcodenum = chunk.opcodenum;

        var op_code = getOpcodeByNumber(opcodenum);

        // extract and add the debug symbol from the chunk and add the opcode to it
        var debug = chunk.debug;
        debug.opcode = op_code;

        Parser.prototype.stackArray[_countStackArray] = new Array();
        Parser.prototype.stackArray[_countStackArray][0] = debug;

        for (var i = 0; i < here.stack.length; i++) {
            Parser.prototype.stackArray[_countStackArray][i + 1] = here.stack[i].toString('hex');
        }

        _countStackArray++;
    };

    /**
     * Maps the integer representation of op_codes to a string representation 
     * (for example the integer 172 is mapped to the string OP_CHECKSIG).
     * 
     * @param {Integer} value Integer representation of the op_code number
     * @returns {String} Returns the string representation of the op_code corresponding to its value (integer).
     */
    var getOpcodeByNumber = function (value) {
        var map = bitcore.Opcode.map;
        for (var prop in map) {
            if (map.hasOwnProperty(prop)) {
                if (map[prop] === value)
                    return prop;
            }
        }

        // OP_CODEs 1-75 are not defined. Opcode 1-75: The next opcode bytes is data to be pushed onto the stack.
        // Insted of displaying 'undefined' as an opcode the actual number of the opcode is returned.
        return value;
    };

    /**
     * Sets the _countStackArray to 0.
     */
    Parser.prototype.resetCount = function () {
        _countStackArray = 0;
    };

    /**
     * Returns the _countStackArray.
     * 
     * @returns {number} The _countStackArray.
     */
    Parser.prototype.getCount = function () {
        return _countStackArray;
    }
}(bitcore.Script.Interpreter.prototype.step));