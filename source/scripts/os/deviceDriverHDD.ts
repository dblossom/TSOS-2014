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
        // meta-data
        public meta:number;
        // array for hard-drive
        public HardDriveArray;
        // is the drive formated
        public isFormatted:boolean;
        // an array of files and the starting location
        public fileArray;
        // next file location (names)
        public currentFileSector:number;
        public currentFileBlock:number;
        // next file data location
        public currentFileDataTrack:number;
        public currentFileDataSector:number;
        public currentFileDataBlock:number;
        // tells us if the drive is full or not
        public driveFull:boolean;
        
        
        /**
         * The constructor for our HDD driver
         */
        constructor(){
            
            super(this.setDriverEntry(), this.setISR());

        }
        
        /**
         * The set driver entry function
         * Set the track, sector, block, set local storage, stuff like that...
         */
        public setDriverEntry():void{
        
            if(this.supports_html5_storage()){
                // init the vars: could not do it above ... why?
                
                // how many tracks
                this.TRACKS = 4;
                // how many sectors
                this.SECTORS = 8;
                // how many blocks
                this.BLOCKS = 8;
                // how many bytes per block
                this.BYTES_BLOCKS = 64;
                // meta data -- (in use, t, s, b) === 4
                this.meta = 4;
                // where we will store our stuff.
                this.HardDriveArray = window.localStorage;
                // sure why not.
                this.status = "loaded";
                // hhd starts off unformatted
                this.isFormatted = false;

            }else{
                //TODO: error
            }
            
        }
        
        /**
         * sets the ISR - currently serves no purpose
         */
        public setISR():void{ }
        
        /**
         * A method to write data to the disk
         * @param track, sector, block - corresponds to location to write
         *        data is what to write
         */
        public write(track:number, sector:number, block:number, data:string){
            var key:string = String(track) + String(sector) + String(block);
            this.HardDriveArray.setItem(key, data);
            
            // for clarity
            var metaS = data.substring(0, 4);
            var dataS = data.substring(4);
            
            // update the display
            this.updateHDDDisplay(_HDDdisplay, track, sector, block, this.padZeros(this.stringToHex(dataS)), metaS);
        }
        
        /**
         * A method to read and return what is at a location on disk'
         * @param track, sector, block - where to read
         * @return what is there, whether you agree or not.
         */
        public read(track:number, sector:number, block:number):string{
            var key:string = String(track) + String(sector) + String(block);
            return this.HardDriveArray.getItem(key);
        }
        
        /**
         * A method to format the hard-disk-drive
         */
        public format():boolean{
                        
            if(!this.supports_html5_storage()){
                return (this.isFormatted = false);
            }else{
                for(var t:number = 0; t < this.TRACKS; t++){
                    for(var s:number = 0; s < this.SECTORS; s++){
                        for(var b:number = 0; b < this.BLOCKS; b++){
                            this.write(t, s, b, "0000" + this.zeros());
                        }
                    }
                }
                this.setHDDDisplay(_HDDdisplay);
                this.createMBR();
                // set the file array
                this.fileArray = new Array<File>();
                // we do not start full...
                this.driveFull = false;
                // we need to set the next TSB
                this.currentFileBlock = 1;
                this.currentFileSector = 0;
                this.currentFileDataTrack = 1;
                this.currentFileDataSector = 0;
                this.currentFileDataBlock = 0;
                return (this.isFormatted = true);
            }
        }
        
        /**
         * A function that creates an empty file
         */
        public create(name:string):boolean{
            
            if(!this.driveFull){
            
                this.fileArray.unshift(new File(name, 
                                             this.currentFileDataTrack, 
                                             this.currentFileDataSector, 
                                             this.currentFileDataBlock));
                
                var tempmeta = "1" + String(this.currentFileDataTrack) + String(this.currentFileDataSector) + String(this.currentFileDataBlock);
                
                this.write(0, this.currentFileSector, this.currentFileBlock, (tempmeta + name));
                
                this.setNextDataTSB();
                this.setNextFileTSB();
                
                return true;
            
            }else{
                //TODO: throw an IRQ
            }
        
        }
        
        /**
         * A function that sets the next TSB to write a file
         */
        private setNextFileTSB(){
        
            this.currentFileBlock++;
            
            if(this.currentFileBlock === 8){
                this.currentFileBlock = 0;
                this.currentFileSector++;
            }
            
            if(this.currentFileSector === 8){
                this.driveFull = true;
            }
        }
        
        private setNextDataTSB(){
        
            this.currentFileDataBlock++;
            
            if(this.currentFileDataBlock === 8){
                this.currentFileDataBlock = 0;
                this.currentFileDataSector++;
            }
            
            if(this.currentFileDataSector === 8){
                this.currentFileDataSector = 0;
                this.currentFileDataTrack++;
            }
            
            if(this.currentFileDataTrack === 4){
                this.driveFull = true;
            }
        }
        
        /**
         * A function that creates an MBR
         */
        private createMBR(){
            this.write(0,0,0,"1---MBR_BLOSSOM");
        }
        
        /**
         * Just so I do not need to type 64 zeros all the time - I just call this
         * TODO: tweak is so it is bytes - meta...so 60 maybe? not sure until we
         *       start to need the meta data
         */
        private zeros():string {
            var zero:string = "0";
            for(var i:number = 1; i < (this.BYTES_BLOCKS - this.meta); i++){
                zero = zero + "0";
            }
            return zero;
        }
        
        /**
         * A method to pad the number of zeros at the end of the string
         */
        private padZeros(toPad:string):string{
        
            while(toPad.length < (this.BYTES_BLOCKS - this.meta)){
                toPad = toPad + "0";
            }
            
            return toPad;
        
        }
        
        /**
         * A function that will convert strings to hex... cool.
         */
        private stringToHex(fromString:string):string{
            
            var toHex:string = "";
            
            for(var i:number = 0; i < fromString.length; i++){
                var toHex = toHex + fromString.charCodeAt(i).toString(16);
            }
            return toHex;
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
        
        public updateHDDDisplay(tblElement: HTMLTableElement, t:number, s:number, b:number, data:string, meta:string):void{
            
            var TSB: string = String(t) + String(s) + String(b);
            
            for(var i:number = 0; i < (tblElement.rows.length - 1); i++){
                
                var row = null;
                row = tblElement.rows[i];
                var rowcells = null;
                rowcells = row.cells;
                
                if(TSB === rowcells[0].innerHTML){
                    
                    rowcells[1].innerHTML = meta;
                    rowcells[2].innerHTML = data;
                    
                    break;
                }
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
                
                row.insertCell(1).innerHTML = "0000";
                row.insertCell(2).innerHTML = this.zeros();
            }
        }     
    }
}