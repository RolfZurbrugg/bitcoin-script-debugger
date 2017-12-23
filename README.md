# Bitcoin Script Debugger

The Bitcoin Script Debugger is a web-based IDE that allows to run and debug bitcoin scripts in a standalone environment.

## Feature Overview

* Easy to use user interface
* Syntax highlighting
* Automatic code formatting
* Step-by-step debugging

## User Guide

The IDE is either in one of two modes: The Edit mode or Debug mode.

### Edit mode

While being in the Edit mode, you can edit both the input and output script. The IDE comes with an auto formatting feature that allows you to automatically format your script so that they look nicely and can be better read. To format your scripts simply click on the Auto Format button:

![alt text](https://github.com/RolfZurbrugg/bitcoin-script-debugger/blob/master/readme-res/btnAutoFormatScript.png "Auto Format button")

To enter the debug mode you can press the Run button which executes the script and shows the final stack after both scripts have been executed (you will still be able to step through the script though):

![alt text](https://github.com/RolfZurbrugg/bitcoin-script-debugger/blob/master/readme-res/btnRunScript.png "Run button")

Or you can start debugging your script from the beginning by simply pressing on the Step Forward button which execute the scripts step by step:

![alt text](https://github.com/RolfZurbrugg/bitcoin-script-debugger/blob/master/readme-res/btnStepForwardScript.png "Run button")

### Debug Mode

When you have entered the Debug mode, you cannot edit or format the scripts anymore. To do that you have to go back into the Edit mode. As long as you are in the Edit mode you can step back and forth through your script and inspect the current stack:

You can Step Forward with the Step Forward button as already mentiond before. The Step Backward button allows you to go back to the previous execution step:

![alt text](https://github.com/RolfZurbrugg/bitcoin-script-debugger/blob/master/readme-res/btnStepBackwardScript.png "Step Backward button")

Inside the script editors the Opcode that gets executed next when you press the Step Forward button is highlighted. This doesn't work for the Step Backward button though.

To go back into the Edit mode simply click on the Stop button:

![alt text](https://github.com/RolfZurbrugg/bitcoin-script-debugger/blob/master/readme-res/btnStopScript.png "Step Backward button")

## Technical Overview

### Architecture

The Bitcoin Script Debugger builts on top of the JavaScript Bitcore library from bitcore.io and is roughly composed of the following layers:

![alt text](https://github.com/RolfZurbrugg/bitcoin-script-debugger/blob/master/readme-res/architecture.png "Architectural Overview")

#### User Interface

The User Interface definition is implemented in the index.html file and styled using the css/app.css file (not shown in the picture).

#### Application Layer

The Application Layer is responsible for what is actually shown on the User Interface. It controls the appeareance and behaviour of the user controls and delegates actions down to the next layers like evaluation of the bitcoin scripts. Error handling is also done in the Application Layer.



