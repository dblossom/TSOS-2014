///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {
    
        public caps: boolean;

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
            
            // need to grab caps first or all hell would break loose.
            if(keyCode == 20){
                this.caps = !this.caps;
            }
            
            // just a regular char -- did not need the other range
            // A and a == 65 regardless. 
            if ((keyCode >= 65)&& (keyCode <= 90)){
                
                // is the shift key pressed?
                // if not, we want the lower-case
                // else leave alone for upper-case 
                if(!isShifted && !this.caps){
                    chr = String.fromCharCode(keyCode + 32);
                }else{
                    chr = String.fromCharCode(keyCode);
                }
                
                //TODO: move this, so we set it one time at end of method.
                _KernelInputQueue.enqueue(chr);
                
            }else if(!isShifted){
                
                // we are a number
                // not sure how excited I am about this ... 
                // will the switch below mess this up ...
                // will I need an else if .. if so that sucks
                if(keyCode >= 48 && keyCode <= 57){ 
                    chr = String.fromCharCode(keyCode);
                }
                
                // I HATE || || || || ... so let us switch
                // fwiw: not a fan of switch either
                switch(keyCode){
                    
                    case 8: // backspace 
                        chr = String.fromCharCode(keyCode);
                        break;      
                        
                    case 9: // tab
                        chr = String.fromCharCode(keyCode);

                    case 32: // space
                        chr = String.fromCharCode(keyCode);
                        break;
                    
                    case 13: // enter
                        chr = String.fromCharCode(keyCode);
                        break;
                    
                    case 173: // "-"
                        chr = String.fromCharCode(45);
                        break;
                    
                    case 61: // "="
                        chr = String.fromCharCode(61);
                        break;
                    
                    case 219: // "["
                        chr = String.fromCharCode(91);
                        break;
                    
                    case 221: // "]"
                        chr = String.fromCharCode(93);
                        break;
                    
                    case 220: // "\" 
                        chr = String.fromCharCode(92);
                        break;
                    
                    case 59: // ";"
                        chr = String.fromCharCode(keyCode);
                        break;
                    
                    case 222: // "'"
                        chr = String.fromCharCode(39);
                        break;
                    
                    case 188: // ","
                        chr = String.fromCharCode(44);
                        break;
                    
                    case 190: // "."    
                        chr = String.fromCharCode(46);
                        break;
                    case 191: // "/" 
                        chr = String.fromCharCode(47);   
                        break;
                        
                    case 192: // "`"
                        chr = String.fromCharCode(96);
                        break;
                    
                    case 38: // "up"
                        chr = "up"
                        break;
                    
                    case 40: // "down"
                        chr = "down"
                        break;    
                    
                }
                
            _KernelInputQueue.enqueue(chr);
            
            // shift key is pressed.
            } else if(isShifted){
                
                switch(keyCode){
                
                    case 48: // ")"
                        chr = String.fromCharCode(41);
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
                        
                    case 192: // "~"
                        chr = String.fromCharCode(126);
                        break;
                    
                    case 173: // "_"
                        chr = String.fromCharCode(95);
                        break;
                    
                    case 61: // "+"
                        chr = String.fromCharCode(43);
                        break;
                        
                    case 219: // "{"
                        chr = String.fromCharCode(123);
                        break;
                    
                    case 221: // "}"
                        chr = String.fromCharCode(125);
                        break;
                    
                    case 220: // "|"
                        chr = String.fromCharCode(124);
                        break;
                    
                    case 59: // ":"
                        chr = String.fromCharCode(58);
                        break;
                    
                    case 222: // """
                        chr = String.fromCharCode(34);
                        break;
                    
                    case 188: // "<"
                        chr = String.fromCharCode(60);
                        break;
                    
                    case 190: // ">"
                        chr = String.fromCharCode(62);
                        break;
                    
                    case 191: // "?"
                        chr = String.fromCharCode(63);
                        break;
                }   
                _KernelInputQueue.enqueue(chr);
            }
        }
    }
}       
