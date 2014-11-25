///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
///<reference path="../utils.ts" />
/* ------------
Shell.ts
The OS Shell - The "command line interface" (CLI) for the console.
------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    var Shell = (function () {
        function Shell() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
        }
        Shell.prototype.init = function () {
            var sc = null;

            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // processes - list the running processes and their IDs
            // kill <id> - kills the specified process id.
            // date (following naming style from methods above - cause that is what you do)
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- displays the current date and time.");
            this.commandList[this.commandList.length] = sc;

            // whereami - randomly displays a location out an array to which
            //            I will add too as time allows ... all will reference
            //            locations in The Shawshank Redemption.
            //            (http://www.imdb.com/title/tt0111161/)
            sc = new TSOS.ShellCommand(this.shellWhere, "whereami", "- displays location relevent to Shawshank Redemption.");
            this.commandList[this.commandList.length] = sc;

            // beammeup - allows the user to be beamed up some place - or does it?
            sc = new TSOS.ShellCommand(this.shellBeam, "beam", "- beams you up ... ");
            this.commandList[this.commandList.length] = sc;

            // status - allows the user to change the default status message
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "<string> - updates status message.");
            this.commandList[this.commandList.length] = sc;

            // load - loads a program from the "program areas"
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "- load program from text area.");
            this.commandList[this.commandList.length] = sc;

            // temp - converts F to C and C to F. If you provide a C it
            //        will convert from F to C and if you provide an F
            //        it will provide C to F. Confusing, maybe make two ?
            sc = new TSOS.ShellCommand(this.shellTempConvert, "temp", "<F | C> - the unit to convert to.");
            this.commandList[this.commandList.length] = sc;

            // bsod - Blue Screen Test!!
            sc = new TSOS.ShellCommand(this.shellTestBSOD, "bsod", "- simulates a bsod");
            this.commandList[this.commandList.length] = sc;

            // run command
            sc = new TSOS.ShellCommand(this.shellRun, "run", "<pid> - executes a program in memory from given pid");
            this.commandList[this.commandList.length] = sc;

            // activate step
            sc = new TSOS.ShellCommand(this.shellStep, "step", "<on | off> - activte or deactivate step");
            this.commandList[this.commandList.length] = sc;

            // clear memory
            sc = new TSOS.ShellCommand(this.shellClearAllMemory, "clearmem", "- clears all memory.");
            this.commandList[this.commandList.length] = sc;

            // change the quantum
            sc = new TSOS.ShellCommand(this.shellChangeQuantum, "quantum", "<int> - the value to make the quantum.");
            this.commandList[this.commandList.length] = sc;

            // run all processes on the _ResidentQueue
            sc = new TSOS.ShellCommand(this.shellRunAll, "runall", "- run all processes on Resident Queue.");
            this.commandList[this.commandList.length] = sc;

            // display all active processes
            sc = new TSOS.ShellCommand(this.shellPS, "ps", "- display all active processes.");
            this.commandList[this.commandList.length] = sc;

            // kill an active process
            sc = new TSOS.ShellCommand(this.shellKill, "kill", "<pid> - The process to kill.");
            this.commandList[this.commandList.length] = sc;

            // format the hdd for use ...
            sc = new TSOS.ShellCommand(this.shellFormat, "format", "- formats the hard-drive");
            this.commandList[this.commandList.length] = sc;

            // creates an empty file and allocates 1 block for it ...
            sc = new TSOS.ShellCommand(this.shellCreate, "create", "<filename> - requested filename");
            this.commandList[this.commandList.length] = sc;

            // deletes a file
            sc = new TSOS.ShellCommand(this.shellDelete, "delete", "<filename> - requested filename to delete");
            this.commandList[this.commandList.length] = sc;

            // writes a file
            sc = new TSOS.ShellCommand(this.shellWrite, "write", "<text> - the text to write (with or without quotes) they will be removed.");
            this.commandList[this.commandList.length] = sc;

            // reads a file
            sc = new TSOS.ShellCommand(this.shellRead, "read", "<filename> - the file you want to read.");
            this.commandList[this.commandList.length] = sc;

            // lists all files
            sc = new TSOS.ShellCommand(this.shellLS, "ls", "- lists all the files.");
            this.commandList[this.commandList.length] = sc;

            // sets the cpu schedule
            sc = new TSOS.ShellCommand(this.shellSetSchedule, "setschedule", "<rr, fcfs, priority> - set the cpu schedule.");
            this.commandList[this.commandList.length] = sc;

            // gets the cpu schedule
            sc = new TSOS.ShellCommand(this.shellGetSchedule, "getschedule", "- gets the current cpu schedule.");
            this.commandList[this.commandList.length] = sc;

            // DELETE ME:
            // test swapping
            sc = new TSOS.ShellCommand(this.testswap, "testswap", "-");
            this.commandList[this.commandList.length] = sc;

            // Display the initial prompt.
            this.putPrompt();
        };

        Shell.prototype.testswap = function (args) {
            _krnHDDdriver.rollOut(_ResidentQueue[args[0]]);
            _krnHDDdriver.rollIn(_ResidentQueue[args[0]]);
        };

        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };

        Shell.prototype.handleInput = function (buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);

            //
            // Parse the input...
            //
            var userCommand = new TSOS.UserCommand();
            userCommand = this.parseInput(buffer);

            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;

            //
            // Determine the command and execute it.
            //
            // JavaScript may not support associative arrays in all browsers so we have to
            // iterate over the command list in attempt to find a match.  TODO: Is there a better way? Probably.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) {
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {
                    this.execute(this.shellApology);
                } else {
                    this.execute(this.shellInvalidCommand);
                }
            }
        };

        // args is an option parameter, ergo the ? which allows TypeScript to understand that
        Shell.prototype.execute = function (fn, args) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();

            // ... call the command function passing in the args...
            fn(args);

            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }

            // ... and finally write the prompt again.
            this.putPrompt();
        };

        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();

            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);

            // 4.2 Record it in the return value.
            retVal.command = cmd;

            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };

        //
        // Shell Command Functions.  Again, not part of Shell() class per se', just called from there.
        //
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Duh. Go back to your Speak & Spell.");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        };

        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };

        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("Okay. I forgive you. This time.");
                _SarcasticMode = false;
            } else {
                _StdOut.putText("For what?");
            }
        };

        Shell.prototype.shellVer = function (args) {
            _StdOut.putText("Version: " + APP_VERSION);
        };

        Shell.prototype.shellHelp = function (args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        };

        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putText("Shutting down...");

            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        };

        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };

        Shell.prototype.shellMan = function (args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        };

        Shell.prototype.shellTrace = function (args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, dumbass.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }

                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        };

        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };

        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };

        /**
        * Displays the current date
        */
        Shell.prototype.shellDate = function (args) {
            _StdOut.putText(new Date().toLocaleString());
        };

        /**
        * Displays random locations from the movie Shawshank
        * TODO: Add more places.
        */
        Shell.prototype.shellWhere = function (args) {
            // our array of locations
            var places = [
                "Shawshank Prison Libray",
                "Roof of the license-plate factory",
                "Red's cell# 237",
                "Zihuatanejo",
                "A river of shit...",
                "The yard",
                "Foodway",
                "The Brewer",
                "In front of the parole board",
                "Buxton"];

            // our "random" location to choose from
            var i = Math.floor(Math.random() * 10);

            // and that location was ...
            _StdOut.putText(places[i]);
        };

        /**
        * displays an insulting thing when asking the console to beam you up
        */
        Shell.prototype.shellBeam = function (args) {
            _StdOut.putText("You are now being beamed up to the mothership please stand by...");
            _StdOut.advanceLine();
            _StdOut.putText("...you're not getting beamed anywhere you fucking idiot.");
            _StdOut.advanceLine();
            _StdOut.putText("asses like you are why people like that fucking fraud Theresa Caputo are rich.");
        };

        /**
        * Changes the text of the status bar
        */
        Shell.prototype.shellStatus = function (args) {
            if (args.length <= 0) {
                _StdOut.putText("Usage: status <string>  Please supply a string.");
            } else {
                // TODO: add to log ? seems like a log action ?
                var argsString = "";

                // first are there more than one argument
                // will be an array if it is, so we need to
                // add to a string - with spaces
                if (args instanceof Array) {
                    for (var i = 0; i < args.length; i++) {
                        argsString += args[i] + " ";
                    }
                } else {
                    // not an array - so just set it
                    argsString = args;
                }

                // clear the canvas so we do not overlap
                _StatusContext.clearRect(0, 0, _Status.width, _Status.height);

                // set the font
                _StatusContext.font = '12pt Arial';

                // append System Status to the front of the string
                argsString = "System status: " + argsString;

                //FINALLY put the test on the canvas.
                _StatusContext.fillText(argsString, 0, (_DefaultFontSize + 5));
            }
        };

        /**
        * Will load a program into memory
        * TODO: Modularize code, too big, too much going on here!
        *       Too late tonight to break this.
        */
        Shell.prototype.shellLoad = function (args) {
            // are we loading a "valid" program -- IE everything is valid hex?
            var isValid = new Shell().validateProgram(_ProgramTextArea.value.trim());

            var textInput = _ProgramTextArea.value.trim();

            textInput = textInput.replace(/ /g, "");

            // Yep, but do we have free space to load this thing ?
            if (isValid && _MemManager.memoryAvailable()) {
                //TODO: return the fixed string when validating program...
                //      make empty string or maybe return an array? IDK yet.
                // where or where will we put this thing ?
                var activePartition = _MemManager.allocate();

                // we are an informative OS -- let the user know we are loading
                _StdOut.putText("Loading, please wait...");
                _StdOut.advanceLine();
                _StdOut.putText("PID: " + TSOS.PCB.pid);

                // so - let us get the base and limit registers and create a PCB
                var base = _MemManager.memoryRanges[activePartition].base;
                var limit = _MemManager.memoryRanges[activePartition].limit;
                _ResidentQueue[TSOS.PCB.pid] = new TSOS.PCB(base, limit, 0 /* IN_MEMORY */);

                // point incs by 2 every go, i incs by 1. what, what what ?
                // point keeps track of the hex bytes (aka 2 nibbles, aka every 2 chars)
                // i keeps track of where we are in the string
                var point = 0;
                for (var i = 0; i < (textInput.length / 2); i++) {
                    _MemManager.write(i, (textInput.charAt(point++) + textInput.charAt(point++)), _ResidentQueue[TSOS.PCB.pid - 1]);
                }
                // well no room in memory, but how about swapping it to the hard-drive?
            } else if (isValid && _krnHDDdriver.isFormatted) {
                // make a temp pcb
                var tempPCB = new TSOS.PCB(-1, -1, 1 /* HARD_DISK */);
                _ResidentQueue[tempPCB.pidNumber] = tempPCB;
                _krnHDDdriver.rollOut(tempPCB, textInput);

                _StdOut.putText("Loading, please wait...");
                _StdOut.advanceLine();
                _StdOut.putText("PID: " + tempPCB.pidNumber);
            } else {
                // let the user know his/her program is shitty and does not work
                _StdOut.putText("Invalid Program...please try again! (or not).");

                // if no free memory tell them at that time as well.
                if (!_MemManager.memoryAvailable()) {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(OUT_OF_MEM_IRQ, _ProgramTextArea.value));
                }
            }
        };

        /**
        * Will convert from F to C or C to F.
        */
        Shell.prototype.shellTempConvert = function (args) {
            if (args.length < 2 || (args[1].toLowerCase() != "f" && args[1].toLowerCase() != "c")) {
                _StdOut.putText("Usage: temp <temp number> <F | C>.");
            } else if (args[1].toLowerCase() === "f") {
                var temp = args[0];
                temp = (temp * 1.8) + 32;
                _StdOut.putText(args[0] + "C" + " = " + temp.toString() + "F");
            } else if (args[1].toLowerCase() === "c") {
                var temp = args[0];
                temp = (temp - 32) / 1.8;
                _StdOut.putText(args[0] + "F" + " = " + temp.toString() + "C");
            }
        };

        /**
        * Test the BSOD ... Why?
        */
        Shell.prototype.shellTestBSOD = function (args) {
            _Kernel.krnTrapError("shit");
        };

        /**
        * Command to put program on the Ready Queue
        */
        Shell.prototype.shellRun = function (args) {
            // Because we are not using a "used queue" and keeping it on the resident queue
            // we need to know if it is usable...
            var used = (_ResidentQueue[args[0]].currentState === 2 /* TERMINATED */);

            // If a program is in execution, we want to ensure we do not just start processing
            // So, if there is not a program in execution AND we never used it before, just put
            // the process to the back of the queue and update display - scheduler will take over!
            if (_ActiveProgram !== null && !used) {
                // gives to scheduler
                _KernelReadyQueue.enqueue(_ResidentQueue[args[0]]);

                // show us what is going on ...
                _ResidentQueue[args[0]].pcbNewRow(_PCBdisplay);
                // so if there is not an active process we only care if it was used...
            } else if (!used) {
                //change state
                _ResidentQueue[args[0]].currentState = 4 /* READY */;

                // add to queue
                _KernelReadyQueue.enqueue(_ResidentQueue[args[0]]);

                // diplay it
                _ResidentQueue[args[0]].pcbNewRow(_PCBdisplay);

                // pass an interrupt to kernel saying, do some work you lazy bum!
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(EXEC_PROG_IRQ, _KernelReadyQueue));
                // whoops, bad PID
            } else {
                _StdOut.putText("Usage: run <pid> active process ID.");
            }
        };

        /**
        * Activates "step" to step through cpu cycles
        */
        Shell.prototype.shellStep = function (args) {
            // did someone say on?
            if (args[0].toUpperCase() === "ON") {
                // activate the button
                document.getElementById("btnStep").disabled = false;

                // tell us we are in step mode
                _StepCPU = true;
                // fine forget step mode
            } else if (args[0].toUpperCase() === "OFF") {
                // disable the button
                document.getElementById("btnStep").disabled = true;

                // tell us we are no longer manually stepping
                _StepCPU = false;
            } else {
                _StdOut.putText("Usage: step <on | off> turn step on or off");
            }
        };

        /**
        * Will clear all memory NO Program can be in execution or
        */
        Shell.prototype.shellClearAllMemory = function (args) {
            // A few conditions must be met here ...
            // 1) do not want to clear active process
            // 2) do not want to clear a process on ready queue
            // 3) do not want to clear a process on resident queue waiting to be passed to ready queue
            // assume we can clear ...
            var allMemoryClear = true;

            // let us do this one by one for right now...
            if (_ActiveProgram !== null) {
                allMemoryClear = false;
            } else if (_KernelReadyQueue.getSize > 0) {
                allMemoryClear = false;
            } else {
                for (var i = 0; i < _ResidentQueue.length; i++) {
                    if (_ResidentQueue[i].currentState !== 2 /* TERMINATED */) {
                        allMemoryClear = false;
                        break;
                    }
                }
            }

            if (allMemoryClear) {
                _StdOut.putText("Clearing memory please wait...");
                _MemManager.clearAllMemory();
                _StdOut.putText("Memory is now clear...");
            } else {
                _StdOut.putText("Cannot clear memory if active process is running or waiting to run, please run all processes and try again");
            }
        };

        /**
        * This will change the quantum rr scheduling
        * @params - int the value to provide for the quantum
        */
        Shell.prototype.shellChangeQuantum = function (args) {
            // did we get a value above 0
            if ((args[0] > 0)) {
                // yep, set the new quantum
                _Quantum = args[0];

                // if we do not set this now, the first round will have the old quantum...
                _CPU_Schedule.cpuCount = _Quantum;

                // log the event - also tell the user...
                var message = "Quantum now set to: " + _Quantum;
                _StdOut.putText(message);
                TSOS.Control.hostLog(message, "SCHEDULE EVENT");

                // have a little fun with values that were passed
                if (_Quantum > 8) {
                    _StdOut.putText(" Why so large?");
                }
                if (_Quantum == 1) {
                    _StdOut.putText(" Really? Really? Making me work today");
                }
            } else {
                _StdOut.putText("Usage: quantum <int> number greater than zero (0)!");
            }
        };

        /**
        * Run all processes on the resident queue
        */
        Shell.prototype.shellRunAll = function (args) {
            // make sure no params were passed ..
            if (typeof args[0] !== 'undefined') {
                _StdOut.putText("Usage: Nothing! Just type runall and all processes will run");
            } else {
                for (var i = 0; i < _ResidentQueue.length; i++) {
                    // if a new process has been found, add it to the ready queue and update the display
                    if (_ResidentQueue[i].currentState === 0 /* NEW */) {
                        _KernelReadyQueue.enqueue(_ResidentQueue[i]);
                        _ResidentQueue[i].pcbNewRow(_PCBdisplay);
                    }
                }

                // now pass the ready queue to the kernel for execution and scheduling.
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(EXEC_PROG_IRQ, _KernelReadyQueue));
            }
        };

        /**
        * Display all active processes
        */
        Shell.prototype.shellPS = function (args) {
            // is a process being executed?
            if (_ActiveProgram !== null) {
                _StdOut.putText("Process ID: " + _ActiveProgram.pidNumber);
                _StdOut.advanceLine();
            }

            // anything on the queue? -- do not want to print if there is only
            // one active program, so make sure that is not null!
            if (_KernelReadyQueue.getSize() === 0 && _ActiveProgram === null) {
                _StdOut.putText("No active processes.");
            }

            for (var i = 0; i < _KernelReadyQueue.getSize(); i++) {
                _StdOut.putText("Process ID: " + _KernelReadyQueue.q[i].pidNumber);
                _StdOut.advanceLine();
            }
        };

        /**
        * Kill an active process (do we only kill "ready_queue" processes??)
        */
        Shell.prototype.shellKill = function (args) {
            // So, if we pass an argument higher than our PID counter, well that never existed so must be an error
            if (args[0] < TSOS.PCB.pid) {
                // has the process already terminated -- let them know ... you're too late!
                if (_ResidentQueue[args[0]].currentState === 2 /* TERMINATED */) {
                    _StdOut.putText("Process ID: " + args[0] + " is no longer running.");
                    _StdOut.advanceLine();
                    // otherwise, we need to pass the PCB off to the kernel to be killed
                } else {
                    // WAIT. give me a second to get this done for ya.
                    // TODO: bring isExecuting = true; here since we set it to false! not back in kernel...
                    //       must have been a reason I did that -- have to look into it deeper later.
                    _CPU.isExecuting = false;

                    // now pass it to the interupt queue for termination...
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PCB_KILL_IRQ, _ResidentQueue[args]));
                }
                // well, well, you gave me a bad process ID...
            } else {
                _StdOut.putText("Usage: kill <int> must be an active process, or at least on that existed at some point!");
            }
        };

        /**
        * Format the hard drive
        */
        Shell.prototype.shellFormat = function (args) {
            //TODO: error checking
            if (!_krnHDDdriver.isFormatted) {
                _krnHDDdriver.format();
                _StdOut.putText("Hard Drive has been formatted and mounted.");
            } else if (_krnHDDdriver.isFormatted) {
                //TODO: still format but make sure nothing is running
                _krnHDDdriver.format();
                _StdOut.putText("Hard Drive has been re-formatted and all data has been erased.");
            }
        };

        /**
        * creates an empty file and allocates 1 block also returns if inserted and name
        */
        Shell.prototype.shellCreate = function (args) {
            // first let us make sure the following conditions hold true...
            // 1) it does not start with a . that is reserved for hidden system files (like swap).
            // 2) let us make sure only one param is being passed, no spaces in our file names
            // 3) let us make sure we passed something to call this file - we cannot guess - yet!
            if (typeof args[0] === 'undefined') {
                _StdOut.putText("Usage: create <filename> with or without quotes, the will be omitted");
            } else if (args[0].charAt(0) === ".") {
                _StdOut.putText("files cannot start with a '.'.");
            } else if (typeof args[1] !== 'undefined') {
                _StdOut.putText("Invalid file name, at this time no spaces allowed");
            } else {
                // did it get created?
                var created = _krnHDDdriver.create(args[0]);

                // if it did let us tell the user...
                if (created) {
                    _StdOut.putText("The file " + _krnHDDdriver.fileArray[0].name + " has been created.");
                } else {
                    // okay it was not created, why? idk at this point, hopefully we caught the issue in device driver
                    _StdOut.advanceLine();
                    _StdOut.putText("The file WAS NOT created.");
                }
            }
        };

        /**
        * Deletes a file
        */
        Shell.prototype.shellDelete = function (args) {
            if (args.length !== 1) {
                _StdOut.putText("Invalid file name");
                return;
            }

            var deleted = _krnHDDdriver.deleteFile(args[0]);

            if (deleted) {
                _StdOut.putText(args[0] + " has been deleted");
            } else {
                _StdOut.putText(args[0] + " has not been deleted.");
            }
        };

        /**
        * Writes text to a file
        */
        Shell.prototype.shellWrite = function (args) {
            if (args.length < 2) {
                _StdOut.putText("Usage: <filename> <text>");
            } else {
                var texttowrite = "";
                for (var i = 1; i < args.length; i++) {
                    texttowrite = texttowrite + args[i] + " ";
                }
                var didWrite = _krnHDDdriver.writeFile(args[0], texttowrite);
                if (didWrite) {
                    _StdOut.putText("The text has been written");
                } else {
                    _StdOut.putText("The text has not been written");
                }
            }
        };

        /**
        * Reads a file and prints to screen
        */
        Shell.prototype.shellRead = function (args) {
            var contents = _krnHDDdriver.readFile(args[0]);
            _StdOut.putText(contents);
        };

        /**
        * lists all the file on the system
        */
        Shell.prototype.shellLS = function (args) {
            if (!_krnHDDdriver.isFormatted) {
                _StdOut.putText("The drive is not formatted, nothing to see here, move along");
                return;
            }

            if (typeof args[0] !== 'undefined') {
                _StdOut.putText("Usage: Nothing! Just type ls to list all files");
            } else {
                for (var i = 0; i < _krnHDDdriver.fileArray.length; i++) {
                    if (_krnHDDdriver.fileArray[i].name.charAt(0) !== ".") {
                        _StdOut.putText(_krnHDDdriver.fileArray[i].name);
                        _StdOut.advanceLine();
                    }
                }
            }
        };

        /**
        * Sets the CPU Schedule
        */
        Shell.prototype.shellSetSchedule = function (args) {
            if (args.length !== 1) {
                _StdOut.putText("Usage: rr, fcfs, priority");
                return;
            }
            if (args[0] === "rr") {
                _CPU_Schedule = new TSOS.Schedule(0 /* RR */);
                TSOS.Control.hostLog("Round Robin Set");
                _StdOut.putText("Round Robin Scheduling Set");
                return;
            }
            if (args[0] === "fcfs") {
                _CPU_Schedule = new TSOS.Schedule(1 /* FCFS */);
                TSOS.Control.hostLog("First Come First Serve Set");
                _StdOut.putText("First Come First Serve Scheduling Set");
                return;
            }

            //if(args[0]) === "priority"){
            //      _CPU_Schedule = new Schedule(ScheduleRoutine.PRIORITY);
            //      Control.hostLog("Priority Set");
            //      _StdOut.putText("Priority Scheduling Set");
            //      return;
            //}
            // how did we get here?'
            _StdOut.putText("Invalid scheduling algorithm picked");
        };

        /**
        * Gets the current cpu schedule
        */
        Shell.prototype.shellGetSchedule = function (args) {
            if (args.length > 0) {
                _StdOut.putText("Usage: NOTHING! just type getschedule");
                return;
            }

            switch (_CPU_Schedule.routine) {
                case 0 /* RR */:
                    _StdOut.putText("Round Robin is the current scheduling algorithm");
                    break;

                case 1 /* FCFS */:
                    _StdOut.putText("First Come First Serve is the current scheduling algorithm");
                    break;

                case 2 /* PRIORITY */:
                    _StdOut.putText("Priority is the current scheduling algorithm");
                    break;

                default:
                    _StdOut.putText("Something is very very wrong... no cpu scheduling set?");
            }
        };

        /**
        * Check if program is valid
        */
        Shell.prototype.validateProgram = function (anyString) {
            // TODO: this works so whatever, but needs restructing.
            var isValid = true;

            // first we need to trim <-- actually probably not
            var textInput = anyString;

            // remove all whitespace?
            // replace(" ", "") only removes first
            // The plan here is simple.. We want A 9 00, A9 00 to be treated as the same
            // SO - we remove ALL spaces, and process every "2 nibbles"
            textInput = textInput.replace(/ /g, "");

            // are we blank ?
            if (textInput === "") {
                isValid = false;
            }

            // loop over the entire input grabbing every 2 chars and checking them.
            var pointer = 0;
            while (pointer < textInput.length && isValid == true) {
                // if we get a bad char, set false
                if (!textInput.charAt(pointer++).match(/[A-F0-9]/i)) {
                    isValid = false;
                }
            }

            // since we remove all spaces and we want to load byte size chunks we need to ensure
            // an even number or we could run into an error - just catch that now.
            if (textInput.length % 2 !== 0) {
                isValid = false;
            }
            return isValid;
        };
        return Shell;
    })();
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
