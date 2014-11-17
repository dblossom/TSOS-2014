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
        
        // Tracks
        public TRACKS:number;
        // Sectors
        public SECTORS:number;
        // Blocks
        public BLOCKS:number;
        // bytes
        public BYTES_BLOCKS:number;
        // array for hard-drive
        public HardDriveArray;
        
        /**
         * The constructor for our HDD driver
         */
        constructor() {
            
            super(this.setDriverEntry(), this.setISR()); // just some BS to compile

        }
        
        /**
         * The set driver entry function
         * Set the track, sector, block, set local storage, stuff like that...
         */
        public setDriverEntry():void{
        
            if(this.supports_html5_storage()){
                // init the vars: could not do it above ... why?
                this.TRACKS = 4;
                this.SECTORS = 8;
                this.BLOCKS = 8;
                this.BYTES_BLOCKS = 64;
                this.HardDriveArray = window.localStorage;
        
                this.status = "loaded";
            }else{
                //TODO: error
            }
            
        }
        
        public setISR():void{
            
        }
        
        /**
         * A method that will return if the browser supports html5 storage...
         * Modified from original version: http://diveintohtml5.info/storage.html
         */ 
        public supports_html5_storage():boolean {
            try {
                return 'localStorage' in window && window['localStorage'] !== null;
            } catch (e) {
                return false;
            }
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