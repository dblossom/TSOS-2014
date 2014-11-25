///<reference path="memoryManager.ts" />
/* ------------
Kernel.ts
Routines for the Operating System, NOT the host.
This code references page numbers in the text book:
Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
------------ */
var TSOS;
(function (TSOS) {
    var Kernel = (function () {
        function Kernel() {
        }
        //
        // OS Startup and Shutdown Routines
        //
        Kernel.prototype.krnBootstrap = function () {
            TSOS.Control.hostLog("bootstrap", "host"); // Use hostLog because we ALWAYS want this, even if _Trace is off.

            // Initialize our global queues.
            _KernelInterruptQueue = new TSOS.Queue(); // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array(); // Buffers... for the kernel.
            _KernelInputQueue = new TSOS.Queue(); // Where device input lands before being processed out somewhere.

            _KernelReadyQueue = new TSOS.Queue();

            _Console = new TSOS.Console(); // The command line interface / console I/O device.

            // Initialize the console.
            _Console.init();

            // Initialize standard input and output to the _Console.
            _StdIn = _Console;
            _StdOut = _Console;

            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new TSOS.DeviceDriverKeyboard(); // Construct it.
            _krnKeyboardDriver.driverEntry(); // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);

            //
            // ... more? <-- sure ? initalize memory here?
            //
            // initalize a memory manager
            _MemManager = new TSOS.MemoryManager();

            // initalize the memory display
            _MemManager.initMemoryDisplay(_MemoryDisplay);

            // initalize a list of programs -- err processes really
            // I know this is not a Queue -- but an array .. or list. Sorry.
            _ResidentQueue = new Array();

            // set the default scheduler (round robin)
            _CPU_Schedule = new TSOS.Schedule(0 /* RR */);

            // set the hard drive driver and display
            _krnHDDdriver = new TSOS.DeviceDriverHDD();

            // no need to set the display until drive is formatted, but leave for testing
            //_krnHDDdriver.setHDDDisplay(_HDDdisplay);
            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();

            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new TSOS.Shell();
            _OsShell.init();

            // set a default for "status" (this a good place for this??)
            _OsShell.shellStatus("running...");

            // set mode bit to user mode
            _Mode = 1;

            // Finally, initiate testing.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        };

        Kernel.prototype.krnShutdown = function () {
            this.krnTrace("begin shutdown OS");

            // TODO: Check for running processes.  Alert if there are some, alert and stop.  Else...
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();

            //
            // Unload the Device Drivers?
            // More?
            //
            this.krnTrace("end shutdown OS");
        };

        Kernel.prototype.krnOnCPUClockPulse = function () {
            /* This gets called from the host hardware sim every time there is a hardware clock pulse.
            This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
            This, on the other hand, is the clock pulse from the hardware (or host) that tells the kernel
            that it has to look for interrupts and process them if it finds any.                           */
            // Check for an interrupt, are any. Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO: Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();

                // for fun let us just put the pcb state in "waiting"
                if ((_ActiveProgram !== null)) {
                    _ActiveProgram.currentState = 3 /* WAITING */;
                    _ActiveProgram.setPCBDisplay(_PCBdisplay);
                }
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            } else if (_CPU.isExecuting) {
                _CPU_Schedule.go();
            } else {
                this.krnTrace("Idle");
            }
        };

        //
        // Interrupt Handling
        //
        Kernel.prototype.krnEnableInterrupts = function () {
            // Keyboard
            TSOS.Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        };

        Kernel.prototype.krnDisableInterrupts = function () {
            // Keyboard
            TSOS.Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        };

        Kernel.prototype.krnInterruptHandler = function (irq, params) {
            // This is the Interrupt Handler Routine.  Pages 8 and 560. {
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on.  Page 766.
            this.krnTrace("Handling IRQ~" + irq);

            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR(); // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params); // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                case PCB_END_IRQ:
                    this.krnProcessEnd(_ActiveProgram);
                    break;
                case SYS_CALL_IRQ:
                    this.krnSysCall(params);
                    _StdOut.advanceLine(); // advance a line
                    _OsShell.putPrompt(); // put the active prompt back
                    break;
                case ILLEGAL_MEM_ACCESS:
                    this.krnIllegalMemAccess(params);
                    break;
                case ILLEGAL_OPCODE_IRQ:
                    this.krnIllegalOpCode(params);
                    break;
                case STEP_CPU_IRQ:
                    _CPU.cycle(); // take 1 cpu "step"
                    break;
                case EXEC_PROG_IRQ:
                    // someone typed run, give it to the kernel for execution
                    this.krnProcess(params);
                    break;
                case OUT_OF_MEM_IRQ:
                    // for now just tell the user no memory for program.
                    _StdOut.putText("Sorry, out of memory for program " + params);
                    _StdOut.advanceLine();
                    _OsShell.putPrompt();
                    break;
                case CON_SWITCH_IRQ:
                    this.krnContextSwitch();
                    break;
                case PCB_KILL_IRQ:
                    this.krnProcessKill(params);
                    break;
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        };

        Kernel.prototype.krnTimerISR = function () {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
        };

        //
        // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
        //
        // Some ideas:
        // - ReadConsole
        // - WriteConsole
        // - CreateProcess
        // - ExitProcess
        // - WaitForProcessToExit
        // - CreateFile
        // - OpenFile
        // - ReadFile
        // - WriteFile
        // - CloseFile
        //
        // OS Utility Routines
        //
        Kernel.prototype.krnTrace = function (msg) {
            // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
            if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would lag the browser very quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        TSOS.Control.hostLog(msg, "OS");
                    }
                } else {
                    TSOS.Control.hostLog(msg, "OS");
                }
            }
        };

        Kernel.prototype.krnTrapError = function (msg) {
            TSOS.Control.hostLog("OS ERROR - TRAP: " + msg);

            // display a BSOD - right now msg is not used and we are hard coding fake error messages
            // TODO: maybe allow msg to be passed through ? like what the error is ?
            this.bsod(msg);

            this.krnShutdown();

            clearInterval(_hardwareClockID);
        };

        /**
        * Execute a process
        */
        Kernel.prototype.krnProcess = function (params) {
            // we are about to create a process ... kernel mode
            _Mode = 0;

            // get the next Process
            var pcb = params.dequeue();

            // set our "active pcb pointer"
            // if the pcb is not in memory, we better make is so.
            if (pcb.location === 1 /* HARD_DISK */) {
                _CPU_Schedule.swap(pcb);
            }

            _ActiveProgram = pcb;

            // print a trace so we know ... (hmm, this might not work well - or at all - with run all?)
            TSOS.Control.hostLog("Executing PID: " + pcb.pidNumber, "OS");

            // set the CPU to this PCB's stuff!
            // stuff being (program counter, accumulator, x, y, reg and z flag
            _CPU.PC = pcb.progCount;
            _CPU.Acc = pcb.ACC;
            _CPU.Xreg = pcb.X_reg;
            _CPU.Yreg = pcb.Y_reg;
            _CPU.Zflag = pcb.Z_flag;

            // set isExecuting to be the opposite of step
            _CPU.isExecuting = !_StepCPU;

            // update display
            _CPU.initCPUDisplay();

            // set PCB to running and set display
            // Do we want to set _ActiveProgram maybe ? or set that pointer later ?
            pcb.currentState = 1 /* RUNNING */;
            pcb.setPCBDisplay(_PCBdisplay);

            // process created, execute in user mode
            _Mode = 1;
        };

        /**
        * A system call
        * @params - params, passed by the interupt handler
        */
        Kernel.prototype.krnSysCall = function (params) {
            // we are about to make a system call kernel mode
            _Mode = 0;

            // X Reg is 1 so print the int in the Y register
            if (params === 1) {
                _StdOut.putText(_CPU.Yreg.toString());
                // X reg is 2 so we need to pring the string
            } else if (params === 2) {
                // get address stored in Y
                var address = _CPU.Yreg;

                // keep track of memory starting + locations
                var offset = 0;

                // get the char at a memory location starting at Y going to offset -- this will be clear in a min.
                var charValue = parseInt(_MemManager.read(address + offset, _ActiveProgram), 16);

                while (charValue !== 0) {
                    _StdOut.putText(String.fromCharCode(charValue));
                    offset++;
                    charValue = parseInt(_MemManager.read(address + offset, _ActiveProgram), 16);
                }
            }

            // done, back to user mode
            _Mode = 1;
        };

        /**
        * An illegal access from a read / write in memory just happened!
        * @params - reserved for future use
        */
        Kernel.prototype.krnIllegalMemAccess = function (params) {
            // TODO: Be more informative about what has exactly happened...
            //       maybe only kill the running program... okay.
            // well kernel should throw BSOD right?
            _Mode = 0;

            // first let us clear memory
            _MemManager.clearAllMemory();

            // clear cpu
            _CPU.init();

            // throw a bsod.
            this.bsod("ILLEGAL MEMORY ACCESS ERROR!!! BAD BAD BOY / OR GIRL");

            // shutdown
            this.krnShutdown();
        };

        /**
        * An invalid opcode was passed to the cpu _ bad _ !
        * @params: the bad opcode
        * TODO:  add support to know where you are in memory!
        */
        Kernel.prototype.krnIllegalOpCode = function (params) {
            // First, let us tell the user what the heck just happened.
            _StdOut.putText("BAD OPCODE: " + params.toString(16) + " program (PID: " + _ActiveProgram.pidNumber + ") terminating.");

            // advance a line
            _StdOut.advanceLine();

            // put back the prompt
            _OsShell.putPrompt();

            // set to terminated
            _ActiveProgram.currentState = 2 /* TERMINATED */;

            // update the display
            _ActiveProgram.setPCBDisplay(_PCBdisplay);

            // deallocate memory from active program
            _MemManager.deallocate(_ActiveProgram);

            //bandaid here until I think of something else:
            //clear partition takes an int of 0, 1, 2 so we will find that from the base
            var partition = -1;

            if (_ActiveProgram.base === 0) {
                partition = 0;
            } else if (_ActiveProgram.base === 256) {
                partition = 1;
            } else if (_ActiveProgram.base === 512) {
                partition = 2;
            }

            // now that we have the partition, pass it to clear the memory...
            // I am also thinking of making a function in my MMU be public and use it here
            // might serve a better function down the road anyway ...
            _MemManager.clearPartition(partition);

            // reset the cpu
            _CPU.init();

            // set active program to null
            _ActiveProgram = null;

            // TODO: make a function that checks the need to do a context switch and does it
            //       other wise this will get missed some place I feel, or not work ask expected...
            // finally if there is another process on the queue, DO IT! Do not let one bad program
            // spoil all of our fun!
            if (_KernelReadyQueue.getSize() > 0) {
                this.krnProcess(_KernelReadyQueue);
            }
        };

        /**
        * Time to do a context switch
        */
        Kernel.prototype.krnContextSwitch = function () {
            // Change mode bit to kernel
            _Mode = 0;

            // change the current state from running to ready
            _ActiveProgram.currentState = 4 /* READY */;

            // updaet the display
            _ActiveProgram.setPCBDisplay(_PCBdisplay);

            // put the currently running program to the back of the line
            _KernelReadyQueue.enqueue(_ActiveProgram);

            // get the next process to run
            _ActiveProgram = _KernelReadyQueue.dequeue();

            // check to make sure the newly active program resides in memory...if not swap
            if (_ActiveProgram.location === 1 /* HARD_DISK */) {
                _CPU_Schedule.swap(_ActiveProgram);
            }

            // set the CPU with the new pcb's pc, acc, x & y regs and z flag
            _CPU.PC = _ActiveProgram.progCount;
            _CPU.Acc = _ActiveProgram.ACC;
            _CPU.Xreg = _ActiveProgram.X_reg;
            _CPU.Yreg = _ActiveProgram.Y_reg;
            _CPU.Zflag = _ActiveProgram.Z_flag;

            // get back to work - maybe do this last?
            _CPU.isExecuting = true;

            // set the new current to running
            _ActiveProgram.currentState = 1 /* RUNNING */;

            // update the display
            _ActiveProgram.setPCBDisplay(_PCBdisplay);

            // done with kernel mode, put it back
            _Mode = 1;
        };

        /**
        * Activites needed to be completed when a process ends
        */
        Kernel.prototype.krnProcessEnd = function (pcb) {
            // will be dealing with memory and stuff
            _Mode = 0;

            // reset the CPU
            _CPU.init();

            // update the state of process to be terminated
            pcb.currentState = 2 /* TERMINATED */;

            // update the process display on the "GUI"
            pcb.setPCBDisplay(_PCBdisplay);

            // deallocate the memory for the next process
            _MemManager.deallocate(_ActiveProgram);

            // update the CPU displays
            _CPU.initCPUDisplay();

            // reset the counter for the quantum
            _CPU_Schedule.cpuCount = _Quantum;

            // null the active process ...
            _ActiveProgram = null;

            // back to user mode
            _Mode = 1;

            // finally if there is another process on the queue, DO IT!
            if (_KernelReadyQueue.getSize() > 0) {
                this.krnProcess(_KernelReadyQueue);
            }
        };

        /**
        * Kill an active process
        */
        Kernel.prototype.krnProcessKill = function (pcb) {
            // so if the program is running currently just pass it to process end
            if (_ActiveProgram.pidNumber === pcb.pidNumber) {
                this.krnProcessEnd(pcb); // simple enough right?
            } else {
                for (var i = 0; i < _KernelReadyQueue.getSize(); i++) {
                    // do we have a match ...
                    if (pcb.pidNumber === _KernelReadyQueue.q[i].pidNumber) {
                        // okay ... match found, now what ?
                        // splice - nice function, removes (or adds) to a queue at a spot!
                        // hmmm -- maybe this will help with a heap or some other way for priority!
                        _KernelReadyQueue.q.splice(i, 1);

                        // set it to terminated on the resident queue (we are dual purposing the resident queue
                        _ResidentQueue[pcb.pidNumber].currentState = 2 /* TERMINATED */;

                        // update the display to terminated
                        _ResidentQueue[pcb.pidNumber].setPCBDisplay(_PCBdisplay, pcb);

                        // deallocate the memory assigned to this pcb
                        _MemManager.deallocate(pcb);
                    }
                }

                // thank you for pausing, now -- BACK TO WORK!
                _CPU.isExecuting = true;
            }

            // FINALLY, let us print a little message to the terminal so we know what happened...
            // IF it happened, kill in shell will notify if bad PID was passed!
            _StdOut.putText("Process " + pcb.pidNumber + " has been zapped!");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        };

        /**
        * Generates a BSOD
        * TODO: remove some of the hard coded values (?) <-- maybe
        */
        Kernel.prototype.bsod = function (msg) {
            // just testing, hard coding stuff --
            // hope to make something better later
            _DrawingContext.clearRect(0, 0, 500, 500);
            _DrawingContext.fillStyle = "blue";
            _DrawingContext.fillRect(0, 0, _Canvas.width, _Canvas.height);
            _DrawingContext.font = "bold 25px Arial";
            _DrawingContext.fillStyle = "white";

            // if we want to add a little message to the top of the BSOD
            if (msg !== "") {
                _DrawingContext.fillText(msg, 0, 90);
            }
            _DrawingContext.fillText(" :( ", 0, 120);
            _DrawingContext.fillText("You're FUCKED!", 0, 150);
            _DrawingContext.fillText("Toss the PC in the Trash!", 0, 180);
            _DrawingContext.fillText("What are we going to do ?", 0, 210);
            _DrawingContext.fillText("Have you tried turning it off and on again?", 0, 240);
        };
        return Kernel;
    })();
    TSOS.Kernel = Kernel;
})(TSOS || (TSOS = {}));
