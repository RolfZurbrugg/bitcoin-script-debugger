# Bitcoin Script Debugger

The Bitcoin Script Debugger is a web-based IDE that allows to run and debug bitcoin scripts in a standalone environment.

![alt text](https://github.com/RolfZurbrugg/bitcoin-script-debugger/blob/master/doc/ide2.png "Screenshot of the IDE")

## Feature Overview

* Easy to use user interface
* Syntax highlighting
* Automatic code formatting
* Step-by-step debugging
* Predefined Script Variables for experimenting
* Check if a script is standard or not

## User Guide

The IDE is either in one of two modes: The Edit mode or Debug mode.

### Edit mode

While being in the Edit mode, you can edit both the input and output script. The IDE comes with an auto formatting feature that allows you to automatically format your script so that they look nicely and can be better read. To format your scripts simply click on the Auto Format button:

![alt text](https://github.com/RolfZurbrugg/bitcoin-script-debugger/blob/master/doc/btnAutoFormatScript.png "Auto Format button")

To enter the debug mode you can press the Run button which executes the script and shows the final stack after both scripts have been executed (you will still be able to step through the script though):

![alt text](https://github.com/RolfZurbrugg/bitcoin-script-debugger/blob/master/doc/btnRunScript.png "Run button")

Or you can start debugging your script from the beginning by simply pressing on the Step Forward button which execute the scripts step by step:

![alt text](https://github.com/RolfZurbrugg/bitcoin-script-debugger/blob/master/doc/btnStepForwardScript.png "Run button")

### Debug Mode

When you have entered the Debug mode, you cannot edit or format the scripts anymore. To do that you have to go back into the Edit mode. As long as you are in the Edit mode you can step back and forth through your script and inspect the current stack:

You can Step Forward with the Step Forward button as already mentiond before. The Step Backward button allows you to go back to the previous execution step:

![alt text](https://github.com/RolfZurbrugg/bitcoin-script-debugger/blob/master/doc/btnStepBackwardScript.png "Step Backward button")

Inside the script editors the Opcode that gets executed next when you press the Step Forward button is highlighted. This doesn't work for the Step Backward button though.

To go back into the Edit mode simply click on the Stop button:

![alt text](https://github.com/RolfZurbrugg/bitcoin-script-debugger/blob/master/doc/btnStopScript.png "Stop button")

### Script Variables

The Bitcoin Script Debugger includes some predefined variables to experiment with. You can see all of them in the right bottom pane of the IDE:

![alt text](https://github.com/RolfZurbrugg/bitcoin-script-debugger/blob/master/doc/variables.png "Variables").

To use them in your script simply write their corresponding name in curly braktes like so: `<sig_0> <pubK_0> OP_CHECKSIG`.

### Signing a Transaction

In order to use OP_CHECKSIG the scriptPubKey script must be present. After signing the transaction the scriptPubKey script can no longer be edited. A dummy transaction is created in the background and the specified private key from the drop down will be used, to sign the transaction. At this point the user has access to the script variable <sig_0>. 

### Check if a script is standard

In the header of each editor pane is a Check Standard button. You can click this button to check if the given script is a standard script or not:

![alt text](https://github.com/RolfZurbrugg/bitcoin-script-debugger/blob/master/doc/btnCheckStandard2.png "Check Standard button")

## Technical Overview

### Architecture

The Bitcoin Script Debugger builts on top of the JavaScript Bitcore library from bitcore.io and is roughly composed of the following layers:

![alt text](https://github.com/RolfZurbrugg/bitcoin-script-debugger/blob/master/doc/architectur.png "Architectural Overview")

#### User Interface

The User Interface definition is implemented in the index.html file and is based on the popular CSS Framework Bootstrap 3. Additional styles and modifications of 3rd Party styles have been made in the css/app.css file.

#### Application Layer

The Application Layer is responsible for what is actually shown on the User Interface. It controls the appeareance and behaviour of the user controls and delegates actions down to the next layers like evaluation of the bitcoin scripts. Error handling is also done in the Application Layer.

#### Script Parser and Debug Layer

The bitcore library itself does not support debugging of scripts. The library itself can simple execute a script and return its final result. In order to be able to debug scripts a separate Script Parser is used together with a Debug Layer. The custom Script Parser allows for using custom variables and mapping of the opcodes to their corresponding positions in the text editor. The Debug Layer hooks itself into the bitcore interpreter and saves a copy of the actual stack after each executed step.

#### Bitcoin Script Interpreter

At the core of the IDE lays the Bitcoin Script Interpreter which is only a small part of the bitcore lib. More details about the bitcore lib itself can be found here: http://www.bitcore.io.

### Other used Libraries

#### CodeMirror

CodeMirror is a powerful text editor that is especially designed for coding. While CodeMirror supports a huge range of languages out of the box, Bitcoin Script or simply called Script is not one of them. So a custom mode (something like a language plugin) had to be implemented in order to support Script. This mode and the auto formatting feature has been implemented in the codeMirrorExtensions.js file. More details about CodeMirror can be found here: https://codemirror.net/.

#### jQuery

There is almost no JavaScript that works without jQuery. Neither does our Bitcoin Script Debugger. jQuery deals with a lot of cross browser compatibility issues and abstracts the interaction with the DOM structure. More details about jQuery can be found here: https://jquery.com/.
