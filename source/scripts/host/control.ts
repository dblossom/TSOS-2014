///<reference path="../globals.ts" />
///<reference path="../os/canvastext.ts" />

/* ------------
     Control.ts

     Requires globals.ts.

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

//
// Control Services
//
module TSOS {

    export class Control {

        public static hostInit(): void {
            // Get a global reference to the canvas.  TODO: Move this stuff into a Display Device Driver, maybe?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext('2d');

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taHostLog")).value="";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("btnStartOS")).focus();
            
            // get a reference to the program text area.
            _ProgramTextArea = <HTMLTextAreaElement> document.getElementById('taProgramInput');
            
            // small canvas for status message
            _Status = <HTMLCanvasElement> document.getElementById('status');
            _StatusContext = _Status.getContext('2d');
            
            // small canvas for date/time
            _DateTime = <HTMLCanvasElement> document.getElementById('datetime');
            _DateTimeContext = _DateTime.getContext('2d');
            
            // memory display
            _MemoryDisplay = <HTMLTableElement> document.getElementById('memoryTable');
            
            // pcb display
            _PCBdisplay = <HTMLTableElement> document.getElementById('PCBTable');

            // Check for our testing and enrichment core.
            if (typeof Glados === "function") {
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }

        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now: number = new Date().getTime();

            // Build the log string.
            var str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now  + " })"  + "\n";

            // Update the log console.
            var taLog = <HTMLInputElement> document.getElementById("taHostLog");
            
            // so...get the first msg to find out what the "state" of cpu is
            // this will give us the index of msg: in the string
            var findLastMsgIndex = taLog.value.indexOf("msg:");
            // here we just add 4 for msg: and go for spaces since idle is 4 chars
            var findLastMsgString = taLog.value.substr(findLastMsgIndex+4,4);
            // now let us check 2 things 1) current message is idle AND new message is idle
            if(findLastMsgString.toUpperCase() === "IDLE" && msg.toUpperCase() === "IDLE"){
               // so it is, get the end of the line.
                var trimPointStart = (taLog.value.search(" }"));
                
                // +4 that is when the next line start (this caused me a bit of a headache)
                // if you look at old commits at the ugly I was trying to do
                // anyway: let us get the oldvalue minus that first line
                var oldValue = taLog.value.substring((trimPointStart + 4), taLog.value.length);
                
                //finally repalce that first line with the new line, updating 'clock' and 'now'
                taLog.value = str + oldValue;

            }else{ // we are not logging repeated idle's so ... show us!
                taLog.value = str + taLog.value;
            }
            // Optionally update a log database or some streaming service.
        }


        //
        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the Halt and Reset buttons ...
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu();
            _CPU.init();
            // ... initalize the CPU display
            _CPU.initCPUDisplay();

            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();
        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }
        
        public static hostBtnStep_click(btn): void{
            
            // run 1 cpu cycle by calling an IRQ!
            // this basically just calls cycle() using an interrupt
            // mainly to keep program execution inside the kernel.
            
            // little bandaid to ensure we are only stepping an active process
            // so not "new" and not "terminated" any other state and we would
            // be considered an active process. We could be waiting from an IRQ
            // we could be running currently, or ready (IE: sitting on readyqueue)
            if(_ResidentQueue[PCB.pid - 1].currentState !== State.TERMINATED &&
               _ResidentQueue[PCB.pid - 1].currentState !== State.NEW){
               
                   _KernelInterruptQueue.enqueue(new Interrupt(STEP_CPU_IRQ, 0));
            }
            
        }
    }
}
