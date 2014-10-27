///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
///<reference path="../utils.ts" />

/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {

        }

        public init() {
            var sc = null;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // processes - list the running processes and their IDs
            // kill <id> - kills the specified process id.
            
            // date (following naming style from methods above - cause that is what you do)
            sc = new ShellCommand(this.shellDate, 
                                  "date", 
                                  "- displays the current date and time.");
            this.commandList[this.commandList.length] = sc;
            
            // whereami - randomly displays a location out an array to which
            //            I will add too as time allows ... all will reference
            //            locations in The Shawshank Redemption. 
            //            (http://www.imdb.com/title/tt0111161/)
            sc = new ShellCommand(this.shellWhere,
                                 "whereami",
                                 "- displays location relevent to Shawshank Redemption.");
            this.commandList[this.commandList.length] = sc;
            
            // beammeup - allows the user to be beamed up some place - or does it?
            sc = new ShellCommand(this.shellBeam,
                                  "beam",
                                  "- beams you up ... ");
            this.commandList[this.commandList.length] = sc;
            
            // status - allows the user to change the default status message
            sc = new ShellCommand(this.shellStatus,
                                  "status",
                                  "<string> - updates status message.");           
            this.commandList[this.commandList.length] = sc;
            
            // load - loads a program from the "program areas"
            sc = new ShellCommand(this.shellLoad,
                                  "load",
                                  "- load program from text area.");
            this.commandList[this.commandList.length] = sc;
            
            // temp - converts F to C and C to F. If you provide a C it
            //        will convert from F to C and if you provide an F
            //        it will provide C to F. Confusing, maybe make two ?
            sc = new ShellCommand(this.shellTempConvert,
                                 "temp",
                                 "<F | C> - the unit to convert to.");
            this.commandList[this.commandList.length] = sc;
            
            // bsod - Blue Screen Test!! 
            sc = new ShellCommand(this.shellTestBSOD,
                                  "bsod",
                                  "- simulates a bsod");
            this.commandList[this.commandList.length] = sc;
            
            // run command
            sc = new ShellCommand(this.shellRun,
                                  "run",
                                  "<pid> - executes a program in memory from given pid");
            this.commandList[this.commandList.length] = sc;     

            // activate step
            sc = new ShellCommand(this.shellStep,
                                  "step",
                                  "<on | off> - activte or deactivate step");
            this.commandList[this.commandList.length] = sc;   
            
            // clear memory
            sc = new ShellCommand(this.shellClearAllMemory,
                                  "clearmem",
                                  "- clears all memory.");
            this.commandList[this.commandList.length] = sc;
            
            // change the quantum
            sc = new ShellCommand(this.shellChangeQuantum,
                                  "quantum",
                                  "<int> - the value to make the quantum.");
            this.commandList[this.commandList.length] = sc;
            
            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = new UserCommand();
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
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses. {
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {    // Check for apologies. {
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // args is an option parameter, ergo the ? which allows TypeScript to understand that
        public execute(fn, args?) {
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
        }

        public parseInput(buffer) {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions.  Again, not part of Shell() class per se', just called from there.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Duh. Go back to your Speak & Spell.");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("Okay. I forgive you. This time.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        public shellVer(args) {
            _StdOut.putText("Version: " + APP_VERSION);
        }

        public shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        }

        public shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellMan(args) {
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
        }

        public shellTrace(args) {
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
        }

        public shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }
        
        // date
        public shellDate(args){
            _StdOut.putText(new Date().toLocaleString());
        }
        
        // whereami
        public shellWhere(args){
        
            var places:string[] = ["Shawshank Prison Libray",
                                   "Roof of the license-plate factory",
                                   "Red's cell# 237",
                                   "Zihuatanejo",
                                   "A river of shit...",
                                   "The yard",
                                   "Foodway",
                                   "The Brewer",
                                   "In front of the parole board",
                                   "Buxton"];
                                   
            var i:number = Math.floor(Math.random() * 10);
            
            _StdOut.putText(places[i]);
        
        }
        
        // beam
        public shellBeam(args){
            _StdOut.putText("You are now being beamed up to the mothership please stand by...");
            _StdOut.advanceLine();
            _StdOut.putText("...you're not getting beamed anywhere you fucking idiot.");
            _StdOut.advanceLine();
            _StdOut.putText("asses like you are why people like that fucking fraud Theresa Caputo are rich."); 
        }
        
        public shellStatus(args){
        
            if(args.length <= 0){
                _StdOut.putText("Usage: status <string>  Please supply a string.");

            }else{
                // TODO: add to log ? seems like a log action ?
                var argsString:string = "";
                
                // first are there more than one argument
                // will be an array if it is, so we need to
                // add to a string - with spaces
                if(args instanceof Array){
                    for(var i:number = 0; i < args.length; i++){
                        argsString += args[i] + " ";
                    }
                }else{
                    // not an array - so just set it 
                    argsString = args;
                }    
                
                // clear the canvas so we do not overlap
                _StatusContext.clearRect(0,0,_Status.width, _Status.height);
                // set the font
                _StatusContext.font = '12pt Arial';
                // append System Status to the front of the string
                argsString = "System status: " + argsString;
                //FINALLY put the test on the canvas.
                _StatusContext.fillText(argsString, 0, (_DefaultFontSize + 5));
            }
        }
        
        /**
         * Will load a program into memory
         * TODO: Modularize code, too big, too much going on here!
         *       Too late tonight to break this.
         */
        public shellLoad(args){
        
            // SO: something is happening where I cannot create a function to separate
            //     the validate function... IDK. I debug and see the function, BUT it throws
            //     a type error "not a function" so ... maybe it is eclipse, doubt it...idk
            //     for now, this crap stays.
            var isValid:boolean = true;
            
            // first we need to trim <-- actually probably not
            var textInput:string = _ProgramTextArea.value.trim();
            // remove all whitespace?
            // replace(" ", "") only removes first
            // The plan here is simple.. We want A 9 00, A9 00 to be treated as the same
            // SO - we remove ALL spaces, and process every "2 nibbles"
            textInput = textInput.replace(/ /g,"");
        
            if(textInput === ""){
                isValid = false;
            }
            
            // loop over the entire input grabbing every 2 chars and checking them.
            var pointer: number = 0;
            while(pointer < textInput.length && isValid == true){
            
                if(!textInput.charAt(pointer++).match(/[A-F0-9]/i)){
                    isValid = false;
                }
            }
            
            // since we remove all spaces and we want to load byte size chunks we need to ensure
            // an even number or we could run into an error - just catch that now.
            if(textInput.length % 2 !== 0){
                isValid = false;
            }
             
            // Allocate a partition
            var activePartition:number = _MemManager.allocate();      
            
            if(isValid && (activePartition !== -1)){ 
            
                _StdOut.putText("Loading, please wait...");
                _StdOut.advanceLine();
                
                _MemManager.clearPartition(activePartition);
                
                _StdOut.putText("PID: " + PCB.pid);
                var base:number = _MemManager.memoryRanges[activePartition].base;
                var limit:number = _MemManager.memoryRanges[activePartition].limit;
                _ResidentQueue[PCB.pid] = new PCB(base, limit);
                    
                // point incs by 2 every go, i incs by 1. what, what what ?
                // point keeps track of the hex bytes (aka 2 nibbles, aka every 2 chars)
                // i keeps track of where we are in the string
                var point:number = 0;
                for(var i:number = 0; i < (textInput.length / 2); i++){
                    _MemManager.write(i, (textInput.charAt(point++) + textInput.charAt(point++)),_ResidentQueue[PCB.pid-1] );
                }
                _ResidentQueue[PCB.pid - 1].pcbNewRow(_PCBdisplay);

            }else{
               // let the user know his/her program is shitty and does not work
               _StdOut.putText("Invalid Program...please try again! (or not).");
               if(activePartition === -1){
                   _KernelInterruptQueue.enqueue(new Interrupt(OUT_OF_MEM_IRQ, _ProgramTextArea.value));
               }
            }
        }
        
        // will convert from F to C or C to F.
        public shellTempConvert(args){
            
            if( args.length < 2 ||
               (args[1].toLowerCase() != "f" &&
                args[1].toLowerCase() != "c")){
               
                _StdOut.putText("Usage: temp <temp number> <F | C>.");
            }else if(args[1].toLowerCase() === "f"){
                var temp: number = args[0];
                temp = (temp * 1.8) + 32;
                _StdOut.putText(args[0] + "C" + " = " + temp.toString() + "F");
            }else if(args[1].toLowerCase() === "c"){
                var temp: number = args[0];
                temp = (temp - 32) / 1.8;
                _StdOut.putText(args[0] + "F" + " = " + temp.toString() + "C");
            }
        }
        
        /**
         * Test the BSOD ... Why?
         */
        public shellTestBSOD(args){
            _Kernel.krnTrapError("shit");
        }
        
        /**
         * Command to put program on the Ready Queue
         */
        public shellRun(args){
            //TODO: ERROR CHECKING!!!
            // Are we not terminated? No, then set status to ready and put on ready queue.
            if(_ResidentQueue[args[0]].currentState !== State.TERMINATED){
                //change state
                _ResidentQueue[args[0]].currentState = State.READY;
                // add to queue
                _KernelReadyQueue.enqueue(_ResidentQueue[args[0]]);
                // pass an interrupt to kernel
                _KernelInterruptQueue.enqueue(new Interrupt(EXEC_PROG_IRQ, _KernelReadyQueue));
            }else{ // whoops, bad PID
                _StdOut.putText("Usage: run <pid> active process ID.");
            }
        }
        
        /**
         * Activates "step" to step through cpu cycles
         */
        public shellStep(args){
            
            // did someone say on?
            if(args[0].toUpperCase() === "ON"){
                // activate the button
                document.getElementById("btnStep").disabled = false;
                // tell us we are in step mode
                _StepCPU = true;
            // fine forget step mode    
            }else if(args[0].toUpperCase() === "OFF"){
                // disable the button
                document.getElementById("btnStep").disabled = true;
                // tell us we are no longer manually stepping
                _StepCPU = false;
            }else{ // whoops typo ?
                _StdOut.putText("Usage: step <on | off> turn step on or off");
            }
        }
        
        /**
         * Will clear all memory
         */
        public shellClearAllMemory(args){
            _MemManager.clearAllMemory();
        }
        
        /**
         * This will change the quantum rr scheduling
         * @params - int the value to provide for the quantum
         */
        public shellChangeQuantum(args){
            if((args[0] > 0)){
                var message:string = "Quantum now set to: " + args[0];
                _StdOut.putText(message);
                _Quantum = args[0];
                Control.hostLog(message, "SCHEDULE EVENT");
                if(args[0] > 8){
                    _StdOut.putText(" Why so large?");
                }
            }else{
                _StdOut.putText("Usage: quantum <int> number greater than zero (0)!");
            }
        }
        
    }
}
