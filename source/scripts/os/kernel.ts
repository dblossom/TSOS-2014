///<reference path="memoryManager.ts" />

/* ------------
     Kernel.ts

     Requires globals.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Kernel {
        //
        // OS Startup and Shutdown Routines
        //
        public krnBootstrap() {      // Page 8. {
            Control.hostLog("bootstrap", "host");  // Use hostLog because we ALWAYS want this, even if _Trace is off.

            // Initialize our global queues.
            _KernelInterruptQueue = new Queue();  // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array();         // Buffers... for the kernel.
            _KernelInputQueue = new Queue();      // Where device input lands before being processed out somewhere.
            
            _KernelReadyQueue = new Queue();
            
            _Console = new Console();          // The command line interface / console I/O device.
            
            
            // Initialize the console.
            _Console.init();

            // Initialize standard input and output to the _Console.
            _StdIn  = _Console;
            _StdOut = _Console;

            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new DeviceDriverKeyboard();     // Construct it.
            _krnKeyboardDriver.driverEntry();                    // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);

            //
            // ... more? <-- sure ? initalize memory here?
            //
            
            // initalize a memory manager
            _MemManager = new MemoryManager();
            // initalize the memory display
            _MemManager.initMemoryDisplay(_MemoryDisplay);
            // initalize a list of programs -- err processes really
            // I know this is not a Queue -- but an array .. or list. Sorry.
            // renaming it to follow what it really is in real life...
            _ResidentQueue = new Array<PCB>();

            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();

            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new Shell();
            _OsShell.init();
            
            // set a default for "status" (this a good place for this??)
            _OsShell.shellStatus("running...");

            // Finally, initiate testing.
           if (_GLaDOS) {
               _GLaDOS.afterStartup();
            }
        }

        public krnShutdown() {
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
        }


        public krnOnCPUClockPulse() {
            /* This gets called from the host hardware sim every time there is a hardware clock pulse.
               This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
               This, on the other hand, is the clock pulse from the hardware (or host) that tells the kernel
               that it has to look for interrupts and process them if it finds any.                           */

            // Check for an interrupt, are any. Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO: Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                
                // no scheduler yet - but for fun let us just put the pcb state in "waiting"
                if((_ResidentQueue.length > 0) && (_ResidentQueue[PCB.pid - 1].currentState === State.RUNNING)){
                    _ResidentQueue[PCB.pid - 1].currentState = State.WAITING;
                    _ResidentQueue[PCB.pid - 1].setPCBDisplay(); 
                }
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            } else if (_CPU.isExecuting) { // If there are no interrupts then run one CPU cycle if there is anything being processed. {
                _CPU.cycle();
            } else {                      // If there are no interrupts and there is nothing being executed then just be idle. {
                this.krnTrace("Idle");
            }
        }


        //
        // Interrupt Handling
        //
        public krnEnableInterrupts() {
            // Keyboard
            Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        }

        public krnDisableInterrupts() {
            // Keyboard
            Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        }

        public krnInterruptHandler(irq, params) {
            // This is the Interrupt Handler Routine.  Pages 8 and 560. {
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on.  Page 766.
            this.krnTrace("Handling IRQ~" + irq);

            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR();              // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params);   // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                case PCB_END_IRQ:
                    //TODO: MORE!! we need to keep track of states and such!
                    _CPU.init(); // reset CPU
                    _ResidentQueue[PCB.pid - 1].currentState = State.TERMINATED;
                    _ResidentQueue[PCB.pid - 1].setPCBDisplay();
                    _CPU.initCPUDisplay(); // <-- cannot test progs with this
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
                    _CPU.cycle(); // cycle cpu
                    break;
                case EXEC_PROG_IRQ:
                    // someone typed run, give it to the kernel for execution
                    this.krnProcess(params);
                    break;
                    
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        }

        public krnTimerISR() {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
        }

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
        public krnTrace(msg: string) {
             // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
             if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would lag the browser very quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        Control.hostLog(msg, "OS");
                    }
                } else {
                    Control.hostLog(msg, "OS");
                }
             }
        }

        public krnTrapError(msg) {
            Control.hostLog("OS ERROR - TRAP: " + msg);
            
            // display a BSOD - right now msg is not used and we are hard coding fake error messages
            // TODO: maybe allow msg to be passed through ? like what the error is ?            
            this.bsod(msg);
            
            this.krnShutdown();
            
            clearInterval(_hardwareClockID);
        }
        
        /**
         * Execute a process
         * TODO: Understand and modularize some of this shit.
         */
        public krnProcess(params){
        
            var pcb:PCB = params.dequeue();
            this.krnTrace("Executing PID: " + pcb.progCount);
            _CPU.PC = pcb.base;
            
            // set isExecuting to be the opposite of step
            _CPU.isExecuting = !_StepCPU;
            _CPU.initCPUDisplay();
            
            // this will not work forever -- need a better way to keep track of PID's
            _ResidentQueue[PCB.pid - 1].currentState = State.RUNNING;
            _ResidentQueue[PCB.pid - 1].setPCBDisplay();
        
        }
         
       /**
        * A system call
        * @params - params, passed by the interupt handler 
        */
        public krnSysCall(params){
            if(params === 1){ // x-reg contains a 1 print int stored in Y
                _StdOut.putText(_CPU.Yreg.toString());
            }else if(params === 2){
                var address:number = _CPU.Yreg;
                var offset:number = 0;
                var charValue = parseInt(_MemManager.read(address + offset), 16);
                
                // So, to prevent any null issues we set charValue above before entering loop.
                // I could have done a do while loop to always execute atlest once but for now
                // I am not going too... 2 reasons
                // 1) hate do while loops
                // 2) what if the first value is a 0 <IE: ""> garbage could be passed ... ?
                while(charValue !== 0){
                    _StdOut.putText(String.fromCharCode(charValue));
                    offset++;
                    charValue = parseInt(_MemManager.read(address+offset), 16);
                }
                
            }
        } 
        
        /**
         * An illegal access from a read / write in memory just happened!
         * @params - reserved for future use
         */
         public krnIllegalMemAccess(params){
             // first let us clear memory
             _MemManager.clearRange(0,768);
             // clear cpu
             _CPU.init();
             // throw a bsod.
             this.bsod("ILLEGAL MEMORY ACCESS ERROR!!! BAD BAD BOY / OR GIRL");
         
         }
         
         /**
          * An invalid opcode was passed to the cpu _ bad _ !
          * @params: the bad opcode
          * TODO:  add support to know where you are in memory!
          */
         public krnIllegalOpCode(params){
             
             // First, let us tell the user what the heck just happened.
             _StdOut.putText("BAD OPCODE: " + params.toString(16) + " program terminating.");
             
             // advance a line
             _StdOut.advanceLine();
             
             // put back the prompt
             _OsShell.putPrompt();
             
             // now let us clear all of memory!
             // hard coded 0 - 255 -- will be an issue later!
             _MemManager.clearRange(0, (MAX_MEM_SPACE - 1));
             
             // reset the cpu
             _CPU.init();
         }
        
        /**
         * Generates a BSOD
         * TODO: remove some of the hard coded values (?) <-- maybe 
         */
        private bsod(msg){
            
            // just testing, hard coding stuff --
            // hope to make something better later
            _DrawingContext.clearRect(0,0,500,500);
            _DrawingContext.fillStyle = "blue"; 
            _DrawingContext.fillRect(0, 0, _Canvas.width, _Canvas.height);
            _DrawingContext.font = "bold 25px Arial";
            _DrawingContext.fillStyle = "white";
            // if we want to add a little message to the top of the BSOD
            if(msg !== ""){
                _DrawingContext.fillText(msg, 0, 90);
            }
            _DrawingContext.fillText(" :( ", 0, 120);
            _DrawingContext.fillText("You're FUCKED!", 0, 150);
            _DrawingContext.fillText("Toss the PC in the Trash!", 0, 180);
            _DrawingContext.fillText("What are we going to do ?", 0, 210);
            _DrawingContext.fillText("Have you tried turning it off and on again?", 0, 240);
        }
    }
}
