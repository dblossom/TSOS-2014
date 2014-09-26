///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
///<reference path="../utils.ts" />
///<reference path="../host/memory.ts" />
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

            // Display the initial prompt.
            this.putPrompt();
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

        // date
        Shell.prototype.shellDate = function (args) {
            _StdOut.putText(new Date().toLocaleString());
        };

        // whereami
        Shell.prototype.shellWhere = function (args) {
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

            var i = Math.floor(Math.random() * 10);

            _StdOut.putText(places[i]);
        };

        // beam
        Shell.prototype.shellBeam = function (args) {
            _StdOut.putText("You are now being beamed up to the mothership please stand by...");
            _StdOut.advanceLine();
            _StdOut.putText("...you're not getting beamed anywhere you fucking idiot.");
            _StdOut.advanceLine();
            _StdOut.putText("asses like you are why people like that fucking fraud Theresa Caputo are rich.");
        };

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

        Shell.prototype.shellLoad = function (args) {
            // start with a valid input ?
            var isValid = true;

            var textInput = "";
            textInput = _ProgramTextArea.value;

            // little hack to make sure no blank text is passed.
            if (textInput === "") {
                isValid = false;
            }

            // first we need to trim <-- actually probably not
            textInput.trim();

            // remove all whitespace?
            // replace(" ", "") only removes first
            textInput = textInput.replace(/ /g, "");

            // loop over the entire input ... fun
            // must be a better way ( probably with some
            // built in javascript functions ;) )
            var pointer = 0;
            while (pointer < textInput.length && isValid == true) {
                var tempHexByte = new TSOS.HexByte(new TSOS.Hex(textInput[pointer]), new TSOS.Hex(textInput[++pointer]));
                pointer++;
            }
            _StdOut.putText("The input program is: " + isValid);
        };

        // will convert from F to C or C to F.
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

        Shell.prototype.shellTestBSOD = function (args) {
            _Kernel.krnTrapError("shit");
        };
        return Shell;
    })();
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
