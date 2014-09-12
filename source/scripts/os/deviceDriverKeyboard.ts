///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.
            super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More? <- trick question?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.    TODO: Check that they are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            
            // just a regular char -- did not need the other range
            // A and a == 65 regardless. 
            if ((keyCode >= 65) && (keyCode <= 90)){
                
                // is the shift key pressed?
                // if not, we want the lower-case
                // else leave alone for upper-case
                //TODO: add caps-lock support (sounds easy, prob not). 
                if(!isShifted){
                    chr = String.fromCharCode(keyCode + 32);
                }else{
                    chr = String.fromCharCode(keyCode);
                }
                
                //TODO: move this, so we set it one time at end of method.
                _KernelInputQueue.enqueue(chr);
            }else if((keyCode == 32)    ||   // space
                        (keyCode == 13)) {                       // enter
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            } else if (((keyCode) >= 48 && (keyCode <= 57))){ // digits or symbol
                if(!isShifted){
                    chr = String.fromCharCode(keyCode); // all is normal, print digits
                }
                else{
                    switch(keyCode){
                        
                        case 48: // ")"
                            chr = String.fromCharCode(123);
                            break;
                        
                        case 49: // "!"
                            chr = String.fromCharCode(33);
                            break;
                        
                        case 50: // "@"
                            chr = String.fromCharCode(64);    
                            break;
                            
                        case 51: // "#"
                            chr = String.fromCharCode(35);    
                            break;
                            
                        case 52: // "$"
                            chr = String.fromCharCode(36);
                            break;
                        
                        case 53: // "%"
                            chr = String.fromCharCode(37);
                            break;
                        
                        case 54: // "^"
                            chr = String.fromCharCode(94);    
                            break;
                            
                        case 55: // "&"
                            chr = String.fromCharCode(38);
                            break;
                            
                        case 56: // "*"
                            chr = String.fromCharCode(42);    
                            break;
                            
                        case 57: // "("
                            chr = String.fromCharCode(40);
                            break;
                             
                    }
                }
                _KernelInputQueue.enqueue(chr);
            }
        }
    }
}
