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
            
            super(this.setDriverEntry(), this.setISR()); // just some BS to compile

        }
        
        private setDriverEntry():void{
            this.status = "loaded";
        }
        
        private setISR():void{
            
        }
        
        public setHDDDisplay(tblElement: HTMLTableElement):void{
         
            // only seems to work if we create a null first ... (?)
            var row = null;
            
            var track:number = 0;
            var sector:number = 0;
            var block:number = -1;
            
            while(true){
                row = tblElement.insertRow(-1);

                block++;

                if(block === 8){
                    block = 0;
                    sector++;
                }
                if(sector === 8){
                    sector = 0;
                    track++;
                }
                if(track === 4){
                    break;
                }
                
                var temp = "" + track + sector + block;
                
                row.insertCell(0).innerHTML = temp;
                
                row.insertCell(1).innerHTML = "0.0.0";
                row.insertCell(2).innerHTML = "0000000000000000000000000000000000000000000000000000000000000000";
            }
        }
        
    }
}