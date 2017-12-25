### bitcore-lib

Most of the bitcore lib is well documented under: https://bitcore.io/api/lib/

The github project from bitcore lib can be found under: https://github.com/bitpay/bitcore-lib

The interpreter from bitcore-lib is used in our debug.js to run and verify scripts.

In order to create scripts, that are accepted by the bitcore-lib interpreter, we use their script builder.
The /lib/script/sicript.js module from bitcore-lib presents a multitude of options to create scripts. 
The most prevelent one used in the bitcoin-script-debugger is script.add().


code extract from the bitcore-lib: /lib/script/sicript.js
```$xslt
    Script.prototype.add = function(obj) {
      this._addByType(obj, false);
      return this;
    };
    
    Script.prototype._addByType = function(obj, prepend) {
      if (typeof obj === 'string') {
        this._addOpcode(obj, prepend);
      } else if (typeof obj === 'number') {
        this._addOpcode(obj, prepend);
      } else if (obj instanceof Opcode) {
        this._addOpcode(obj, prepend);
      } else if (BufferUtil.isBuffer(obj)) {
        this._addBuffer(obj, prepend);
      } else if (obj instanceof Script) {
        this.chunks = this.chunks.concat(obj.chunks);
      } else if (typeof obj === 'object') {
        this._insertAtPosition(obj, prepend);
      } else {
        throw new Error('Invalid script chunk');
      }
    };
```
As you can see the script.add() function quiet a few different input types.

The script object is structured as follows:

```$xslt
    {
    chunks: Array[]
    length: <number>
    }
```
The chunks contain the opcode number and incase of operations like OP_PUSHDATA the chunk will also contain a
buffer containing the data which is to be pushed onto the stack in form of a buffer.

In the bitcoin-script-debugger in the parser.js we add a debug object to the chunk. The debug object contains positional information about 
where in the UI script the opcode was.


### parser.js

The parser at the top of the file contains instructions which documents which check needs do be disabled, in order for 
demo multi sig script to work.


Further at the top of the parser.js file a disabled function is documented, that will overwrite 
another check in the bitcore-lib.

The parser is initialized through an emediatly invoked function. The parser is then available to use and is referenced using Parser of P$

The most important functionalities of the parser are:

*P$(string) this will pars a given string of script and returen a script object.

*P$.prototype.variableMap this is a map of variables, that can be used or are needed in order for the user to use variables in his script.

*P$.addKeyValuePari(key, value) adds a new key value pair to the variableMap. the key is expected to be a string.

*P$.getVariableMap() returns the variable map.

*P$.getUserVariableMap() !this function will actualy return an array of all the user variables not a map.



### debug.js

In the debug.js we monkey patch the step function from the bitcore-lib interpreter. This allows us to access the stack
after each opcode is executed. This enables us to construct a 2D array containing the opcodes and the current stack.

To make the function easier to use, it will take the just the string representation of the bitcoin script. The bitcoin scripts
are then parsed by the parser.

Noteworthy is that if a script needs to be verified against a transaction, the transaction needs to be created and set 
before the debug function is called.

### demoScript

The demoScripts.js file contains a number of standard scripts. That with the exception of loadP2PKWithLockTimeDemoScript
all work. These scripts can be used as a template as to how modular custom scripts can be created 
using the bitcoin-script-debugger.

