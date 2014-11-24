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
            
            // run all processes on the _ResidentQueue
            sc = new ShellCommand(this.shellRunAll,
                                  "runall",
                                  "- run all processes on Resident Queue.");
            this.commandList[this.commandList.length] = sc;
            
            // display all active processes
            sc = new ShellCommand(this.shellPS,
                                  "ps",
                                  "- display all active processes.");
            this.commandList[this.commandList.length] = sc;
            
            // kill an active process
            sc = new ShellCommand(this.shellKill,
                                  "kill",
                                  "<pid> - The process to kill.");
            this.commandList[this.commandList.length] = sc;
            
            // format the hdd for use ... 
            sc = new ShellCommand(this.shellFormat,
                                  "format",
                                  "- formats the hard-drive");
            this.commandList[this.commandList.length] = sc;
            
            // creates an empty file and allocates 1 block for it ... 
            sc = new ShellCommand(this.shellCreate,
                                  "create",
                                  "<filename> - requested filename");
            this.commandList[this.commandList.length] = sc;
            
            // deletes a file 
            sc = new ShellCommand(this.shellDelete,
                                  "delete",
                                  "<filename> - requested filename to delete");
            this.commandList[this.commandList.length] = sc;
            
            // writes a file 
            sc = new ShellCommand(this.shellWrite,
                                  "write",
                                  "<text> - the text to write (with or without quotes) they will be removed.");
            this.commandList[this.commandList.length] = sc;
                                  
            // reads a file 
            sc = new ShellCommand(this.shellRead,
                                  "read",
                                  "<filename> - the file you want to read.");
            this.commandList[this.commandList.length] = sc;
            
            // lists all files 
            sc = new ShellCommand(this.shellLS,
                                  "ls",
                                  "- lists all the files.");
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
        
        /**
         * Displays the current date
         */
        public shellDate(args){
            _StdOut.putText(new Date().toLocaleString());
        }
        
        /**
         * Displays random locations from the movie Shawshank
         * TODO: Add more places.
         */
        public shellWhere(args){
        
            // our array of locations
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
            
            // our "random" location to choose from                       
            var i:number = Math.floor(Math.random() * 10);
            
            // and that location was ... 
            _StdOut.putText(places[i]);
        
        }
        
        /**
         * displays an insulting thing when asking the console to beam you up
         */
        public shellBeam(args){
            _StdOut.putText("You are now being beamed up to the mothership please stand by...");
            _StdOut.advanceLine();
            _StdOut.putText("...you're not getting beamed anywhere you fucking idiot.");
            _StdOut.advanceLine();
            _StdOut.putText("asses like you are why people like that fucking fraud Theresa Caputo are rich."); 
        }
        
        /**
         * Changes the text of the status bar
         */
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
            
            // are we loading a "valid" program -- IE everything is valid hex?
            var isValid:boolean = new Shell().validateProgram(_ProgramTextArea.value.trim());
                
            // Yep, but do we have free space to load this thing ?
            if(isValid && _MemManager.memoryAvailable()){
                
                var textInput:string = _ProgramTextArea.value.trim();
                
                //TODO: return the fixed string when validating program...
                //      make empty string or maybe return an array? IDK yet.
                textInput = textInput.replace(/ /g,"");
            
                // where or where will we put this thing ?
                var activePartition:number = _MemManager.allocate();
            
                // we are an informative OS -- let the user know we are loading
                _StdOut.putText("Loading, please wait...");
                _StdOut.advanceLine(); 
                _StdOut.putText("PID: " + PCB.pid);
                
                // so - let us get the base and limit registers and create a PCB
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

            }else{
               // let the user know his/her program is shitty and does not work
               _StdOut.putText("Invalid Program...please try again! (or not).");
               // if no free memory tell them at that time as well.
               if(!_MemManager.memoryAvailable()){
                   _KernelInterruptQueue.enqueue(new Interrupt(OUT_OF_MEM_IRQ, _ProgramTextArea.value));
               }
            }
        }
        
        /**
         * Will convert from F to C or C to F.
         */
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
        
            // Because we are not using a "used queue" and keeping it on the resident queue
            // we need to know if it is usable...
            var used:boolean = (_ResidentQueue[args[0]].currentState === State.TERMINATED);
            
            // If a program is in execution, we want to ensure we do not just start processing
            // So, if there is not a program in execution AND we never used it before, just put
            // the process to the back of the queue and update display - scheduler will take over!
            if(_ActiveProgram !== null && !used){
                // gives to scheduler
                _KernelReadyQueue.enqueue(_ResidentQueue[args[0]]);
                // show us what is going on ... 
                _ResidentQueue[args[0]].pcbNewRow(_PCBdisplay);
                
            // so if there is not an active process we only care if it was used...
            }else if(!used){
                //change state
                _ResidentQueue[args[0]].currentState = State.READY;
                // add to queue
                _KernelReadyQueue.enqueue(_ResidentQueue[args[0]]);
                // diplay it
                _ResidentQueue[args[0]].pcbNewRow(_PCBdisplay);
                // pass an interrupt to kernel saying, do some work you lazy bum!
                _KernelInterruptQueue.enqueue(new Interrupt(EXEC_PROG_IRQ, _KernelReadyQueue));
                
            // whoops, bad PID
            }else{ 
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
         * Will clear all memory NO Program can be in execution or 
         */
        public shellClearAllMemory(args){
        
            // A few conditions must be met here ...
            // 1) do not want to clear active process
            // 2) do not want to clear a process on ready queue
            // 3) do not want to clear a process on resident queue waiting to be passed to ready queue
            
            // assume we can clear ...
            var allMemoryClear:boolean = true;
            
            // let us do this one by one for right now...
            if(_ActiveProgram !== null){
                allMemoryClear = false;
            }else if(_KernelReadyQueue.getSize > 0){
                allMemoryClear = false;
            }else{
                for(var i:number = 0; i < _ResidentQueue.length; i++){
                    if(_ResidentQueue[i].currentState !== State.TERMINATED){
                        allMemoryClear = false;
                        break
                    }
                }
            }
            
            if(allMemoryClear){
                _StdOut.putText("Clearing memory please wait...");
                _MemManager.clearAllMemory();
                _StdOut.putText("Memory is now clear...");
            }else{
                _StdOut.putText("Cannot clear memory if active process is running or waiting to run, please run all processes and try again");
            }
        }
        
        /**
         * This will change the quantum rr scheduling
         * @params - int the value to provide for the quantum
         */
        public shellChangeQuantum(args){
            // did we get a value above 0
            if((args[0] > 0)){
                // yep, set the new quantum
                _Quantum = args[0];
                // if we do not set this now, the first round will have the old quantum...
                _CPU_Schedule.cpuCount = _Quantum;
                // log the event - also tell the user...
                var message:string = "Quantum now set to: " + _Quantum;
                _StdOut.putText(message);
                Control.hostLog(message, "SCHEDULE EVENT");
                // have a little fun with values that were passed
                if(_Quantum > 8){
                    _StdOut.putText(" Why so large?");
                }
                if(_Quantum == 1){
                    _StdOut.putText(" Really? Really? Making me work today");
                }
            }else{ // whoops something is not correct...
                _StdOut.putText("Usage: quantum <int> number greater than zero (0)!");
            }
        }
        
        /**
         * Run all processes on the resident queue
         */
        public shellRunAll(args){
            // make sure no params were passed ..
            if(typeof args[0] !== 'undefined'){
                _StdOut.putText("Usage: Nothing! Just type runall and all processes will run");
            }else{ // valid command
                // so, search the resident queue looking for "new" processes
                for(var i:number = 0; i < _ResidentQueue.length; i++){
                    // if a new process has been found, add it to the ready queue and update the display
                    if(_ResidentQueue[i].currentState === State.NEW){
                        _KernelReadyQueue.enqueue(_ResidentQueue[i]);
                        _ResidentQueue[i].pcbNewRow(_PCBdisplay);
                    }
                }
                // now pass the ready queue to the kernel for execution and scheduling.
                _KernelInterruptQueue.enqueue(new Interrupt(EXEC_PROG_IRQ, _KernelReadyQueue));
            }
        }
        
        /**
         * Display all active processes
         */
        public shellPS(args){
        
            // is a process being executed?
            if(_ActiveProgram !== null){
                _StdOut.putText("Process ID: " + _ActiveProgram.pidNumber);
                _StdOut.advanceLine();
            }
            
            // anything on the queue? -- do not want to print if there is only
            // one active program, so make sure that is not null!
            if(_KernelReadyQueue.getSize() === 0 && _ActiveProgram === null){
                _StdOut.putText("No active processes.");
            }
            
            // well, if there are things on the queue tell the person, they asked!
            for(var i:number = 0; i < _KernelReadyQueue.getSize(); i++){
                _StdOut.putText("Process ID: " + _KernelReadyQueue.q[i].pidNumber);
                _StdOut.advanceLine();
            }        
        }
        
        /**
         * Kill an active process (do we only kill "ready_queue" processes??)
         */
        public shellKill(args){
            
            // So, if we pass an argument higher than our PID counter, well that never existed so must be an error
            if(args[0] < PCB.pid){
                // has the process already terminated -- let them know ... you're too late!
                if(_ResidentQueue[args[0]].currentState === State.TERMINATED){
                    _StdOut.putText("Process ID: " + args[0] + " is no longer running.");
                    _StdOut.advanceLine();
                // otherwise, we need to pass the PCB off to the kernel to be killed
                }else{ 
                    // WAIT. give me a second to get this done for ya.
                    // TODO: bring isExecuting = true; here since we set it to false! not back in kernel...
                    //       must have been a reason I did that -- have to look into it deeper later.
                    _CPU.isExecuting = false;
                    // now pass it to the interupt queue for termination...
                    _KernelInterruptQueue.enqueue(new Interrupt(PCB_KILL_IRQ, _ResidentQueue[args]))
                }
            // well, well, you gave me a bad process ID...
            }else{
                _StdOut.putText("Usage: kill <int> must be an active process, or at least on that existed at some point!");
            }
        }
        
        /**
         * Format the hard drive
         */
        public shellFormat(args){
            //TODO: error checking
            if(!_krnHDDdriver.isFormatted){
                _krnHDDdriver.format();
                _StdOut.putText("Hard Drive has been formatted and mounted.");
            }else if(_krnHDDdriver.isFormatted){
                //TODO: still format but make sure nothing is running
                _krnHDDdriver.format();
                _StdOut.putText("Hard Drive has been re-formatted and all data has been erased.");
            }
        }
        
        /**
         * creates an empty file and allocates 1 block also returns if inserted and name
         */
        public shellCreate(args){

            // first let us make sure the following conditions hold true...
            // 1) it does not start with a . that is reserved for hidden system files (like swap).
            // 2) let us make sure only one param is being passed, no spaces in our file names
            // 3) let us make sure we passed something to call this file - we cannot guess - yet!
            if(typeof args[0] === 'undefined'){
                _StdOut.putText("Usage: create <filename> with or without quotes, the will be omitted");
            }else if(args[0].charAt(0) === "."){
                _StdOut.putText("files cannot start with a '.'.");
            }else if(typeof args[1] !== 'undefined'){
                _StdOut.putText("Invalid file name, at this time no spaces allowed");
            }
            // okay, so we passed the three rules above, so pass the file name to the device driver for writting
            else{
                // did it get created?
                var created = _krnHDDdriver.create(args[0]);
                // if it did let us tell the user...
                if(created){
                    _StdOut.putText("The file " +_krnHDDdriver.fileArray[0].name + " has been created.");
                }else{
                    // okay it was not created, why? idk at this point, hopefully we caught the issue in device driver
                    _StdOut.advanceLine();
                    _StdOut.putText("The file WAS NOT created.");
                }
            }
        }
        
        /**
         * Deletes a file
         */
        public shellDelete(args){
            
            if(args.length !== 1){
                _StdOut.putText("Invalid file name");
                return;
            }
            
            var deleted = _krnHDDdriver.deleteFile(args[0]);
            
            if(deleted){
                _StdOut.putText(args[0] + " has been deleted");
            }else{
                _StdOut.putText(args[0] + " has not been deleted.");
            }
            
        }
        
        /**
         * Writes text to a file
         */
        public shellWrite(args){
        
            if(args.length < 2){
                _StdOut.putText("Usage: <filename> <text>");
            }else{
                 
                var texttowrite:string = "";
                for(var i:number = 1; i < args.length; i++){
                    texttowrite = texttowrite + args[i] + " ";
                }
                _krnHDDdriver.writeFile(args[0], texttowrite);
            }
        }
        
        /**
         * Reads a file and prints to screen
         */
        public shellRead(args){
            _krnHDDdriver.readFile(args[0]);
        }
        
        /**
         * lists all the file on the system
         */
        public shellLS(args){
        
            if(!_krnHDDdriver.isFormatted){
                _StdOut.putText("The drive is not formatted, nothing to see here, move along");
                return;
            }
            
            if(typeof args[0] !== 'undefined'){
                _StdOut.putText("Usage: Nothing! Just type ls to list all files");
            }else{
                for(var i:number = 0; i < _krnHDDdriver.fileArray.length; i++){
                    if(_krnHDDdriver.fileArray[i].name.charAt(0) !== "."){
                        _StdOut.putText(_krnHDDdriver.fileArray[i].name);
                        _StdOut.advanceLine();
                    }
                }
            }
        }
                
        /**
         * Check if program is valid
         */
        public validateProgram(anyString:string){
        
        // TODO: this works so whatever, but needs restructing.
            
            var isValid:boolean = true;
            
            // first we need to trim <-- actually probably not
            var textInput:string = anyString; 
            // remove all whitespace?
            // replace(" ", "") only removes first
            // The plan here is simple.. We want A 9 00, A9 00 to be treated as the same
            // SO - we remove ALL spaces, and process every "2 nibbles"
            textInput = textInput.replace(/ /g,"");
        
            // are we blank ?
            if(textInput === ""){
                isValid = false;
            }
            
            // loop over the entire input grabbing every 2 chars and checking them.
            var pointer: number = 0;
            while(pointer < textInput.length && isValid == true){
                // if we get a bad char, set false
                if(!textInput.charAt(pointer++).match(/[A-F0-9]/i)){
                    isValid = false;
                }
            }
            
            // since we remove all spaces and we want to load byte size chunks we need to ensure
            // an even number or we could run into an error - just catch that now.
            if(textInput.length % 2 !== 0){
                isValid = false;
            }       
            return isValid;
        }
    }
}
