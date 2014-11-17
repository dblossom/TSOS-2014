///<reference path="deviceDriver.ts" />
/* ----------------------------------
   DeviceDriverHDD.ts

   Requires deviceDriver.ts

   The Kernel Hard Disk Drive Device Driver.
   
   Author Dan Blossom
   ---------------------------------- */
   
module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverHDD extends DeviceDriver {
         
        constructor() {
            
            super(0,1); // just some BS to compile

        }
        
        
        public setHDDDisplay(tblElement: HTMLTableElement):void{
         
            // only seems to work if we create a null first ... (?)
            var row = null;
            // insert a row "on top" of the others
            row = tblElement.insertRow(-1);
            
            // set the cell with the new state information
            // the order matters here!
            row.insertCell(0).innerHTML = "0.0.0";
            row.insertCell(1).innerHTML = "1";
            row.insertCell(2).innerHTML = "2";

        }
        
    }
}