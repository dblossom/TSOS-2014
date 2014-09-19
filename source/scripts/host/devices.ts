///<reference path="../globals.ts" />

/* ------------
     Devices.ts

     Requires global.ts.

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and simulation scripts) is the only place that we should see "web" code, like
     DOM manipulation and TypeScript/JavaScript event handling, and so on.  (Index.html is the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Devices {

        constructor() {
            _hardwareClockID = -1;
        }

        //
        // Hardware/Host Clock Pulse
        //
        public static hostClockPulse(): void {
            // Increment the hardware (host) clock.
            _OSclock++;
            
            // we need a reference to "this" object
            // "this" did not work, which makes sense.
            new Devices().setDateTime();
            
            // Call the kernel clock pulse event handler.
            _Kernel.krnOnCPUClockPulse();
        }

        //
        // Keyboard Interrupt, a HARDWARE Interrupt Request. (See pages 560-561 in text book.)
        //
        public static hostEnableKeyboardInterrupt(): void {
            // Listen for key press (keydown, actually) events in the Document
            // and call the simulation processor, which will in turn call the
            // OS interrupt handler.
            document.addEventListener("keydown", Devices.hostOnKeypress, false);
        }

        public static hostDisableKeyboardInterrupt(): void {
            document.removeEventListener("keydown", Devices.hostOnKeypress, false);
        }

        public static hostOnKeypress(event): void {
            // The canvas element CAN receive focus if you give it a tab index, which we have.
            // Check that we are processing keystrokes only from the canvas's id (as set in index.html).
            if (event.target.id === "display") {
                event.preventDefault();
                // Note the pressed key code in the params (Mozilla-specific).
                var params = new Array(event.which, event.shiftKey);
                // Enqueue this interrupt on the kernel interrupt queue so that it gets to the Interrupt handler.
                _KernelInterruptQueue.enqueue(new Interrupt(KEYBOARD_IRQ, params));
            }
        }
        
        // A private method that uses the DateTime Canavs to display ... well ...
        // the date and time. I have not fully decided if here in the hardware
        // section is the place for this -- but, for now it stays.
        private setDateTime(){
            // grab a date object -- how else do we date / time
            var curDate = new Date();
            // set a string to be a date / time object
            // this will be like the "return" string so to speak
            var curDateString = curDate.toLocaleDateString() + " " + curDate.toLocaleTimeString();
            // clear the canvas - do not want overlap the text
            _DateTimeContext.clearRect(0,0,_DateTime.width, _DateTime.height);
            // set font to make it a bit larger and all that
            _DateTimeContext.font = '12pt Arial';
            // I want the text to right justify in the canvas so we need to calculate
            // the lenth of the text - the width to get a starting point for X
            var offset:number = _DateTimeContext.measureText(curDateString).width;
            offset = (_DateTime.width - offset);
            // finally place it on the canvas - pushing Y down just a little further ;)
            _DateTimeContext.fillText(curDateString, offset, (_DefaultFontSize + 5));
        }
    }
}
