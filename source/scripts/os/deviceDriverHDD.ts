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
        
        public swapfilecount:number;
        
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
                _StdOut.putText("Hard drive not mounted, failed to load, please contact vendor.");
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
        public write(tsb:string, data:string){
            this.HardDriveArray.setItem(tsb, data);
            
            // for clarity
            var metaS = data.substring(0, 4);
            var dataS = data.substring(4);
            
            // update the display
            this.updateHDDDisplay(_HDDdisplay, tsb, this.padZeros(this.stringToHex(dataS)), metaS);
        }
        
        /**
         * A method to read and return what is at a location on disk'
         * @param track, sector, block - where to read
         * @return what is there, whether you agree or not.
         */
        public read(tsb:string):string{
            return this.HardDriveArray.getItem(tsb);
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
                            this.write(this.toStringTSB(t,s,b), "0000" + this.zeros());
                        }
                    }
                }
                this.setHDDDisplay(_HDDdisplay);
                this.createMBR();
                // set the file array
                this.fileArray = new Array<File>();
                // we do not start full...
                this.driveFull = false;
                // keep track of swap files
                this.swapfilecount = 0;
                return (this.isFormatted = true);
            }
        }
        
        /**
         * A function that creates an empty file
         */
        public create(name:string):boolean{
        
            // Be warned, we are swarming in if/else / if / else
            // it is ugly and gets a bit too deep for my personal likings
            // with that said ...
            // TODO: clean up the IF's!
        
            // first let us remove any quotes that might have been passed
            name = this.parseQuotes(name);
            
            // if the hard drive is not full, it is formatted and a file name does not exist
            
            if(!this.isFormatted){
                _StdOut.putText("The drive is not formatted");
            }else if(!this.driveFull && (this.lookupFileName(name) === null)){
                // find some free space for this file name
                var freeData = this.findFreeDataTSB();
                // we should not get here .. but if we do
                if(freeData === "-1"){
                    _StdOut.putText("Hard drive is full, no more room for you");
                }else{
                    // let us mark it in use and set the meta to point to its first data point
                    var tempmeta = "1" + freeData;
                    // let us find a place to put this file - ugh this is confusing.
                    var temptsb = this.findFreeTSB();
                    
                    // okay there was room for it ...
                    if(temptsb !== "-1"){
                        // write to the tsb, the meta then append the name
                        this.write(temptsb, (tempmeta + name));
                        // let us mark the data "in use" and no links yet
                        this.write(tempmeta.substring(1), "1---");
                        // store the file name, its tsb and its first data tsb for easy lookup
                        this.fileArray.unshift(new File(name, temptsb ,tempmeta.substring(1)));
                        // return that it happened            
                        return true;
                    }else{
                        // hard drive is full, return false
                        _StdOut.putText("Hard drive is full, no more room for you!");
                        return false;
                    }
                }
            }else{
                // we are either full, not formatted or file exists - we should not hit that last else LOL ...
                if(this.driveFull){
                    _StdOut.putText("Drive Full.");
                }else if(!this.lookupFileName(name) === null){
                    _StdOut.putText("Filename exists");
                }else{
                    _StdOut.putText("Something went wrong, and I am not sure what...sorry.");
                }
                // file was not created!
                return false;
            }        
        }
        
        /**
         * A functioin that deletes a file and all its contents
         */
        public deleteFile(name:string):boolean{
        
            if(!this.isFormatted){
                _StdOut.putText("The drive is not formatted");
                return;
            }
            
            // loop through our file name array
            for(var i:number = 0; i < this.fileArray.length; i++){
                // do we have a match ? awesome!
                if(this.fileArray[i].name === name){
                    // where does it reside?
                    var tsb = this.fileArray[i].tsb;
                    // delete the chain of data (if exists) 
                    // really we just change the inuse and next tsb bits to 0000
                    this.deleteFileChain(this.fileArray[i].tsbData);
                    // let us change the in use bit of the file name location and 
                    // for fun leave the old stuff there ... not sure why
                    this.write(tsb, "0---"+this.read(tsb).substring(4));
                    // remove the file object from our file array
                    this.fileArray.splice(i,1);
                    // return that we did it!
                    return true;
                } 
            }
            // if we got here something went wrong
            return false;
        }
        
        /**
         * A function to write data to a file
         */
        public writeFile(name:string, data:string):boolean{
        
            // Not proud of some of these checks
            // if the drive is not formated, bail...
            if(!this.isFormatted){
                _StdOut.putText("The drive is not formatted!!");
                return;
            }
            // does the file exists?
            var fileToWrite:File = this.lookupFileName(name);
            if(fileToWrite === null){
                _StdOut.putText("File does not exist.");
            }else{
                // first we need to delete the chain of text that might exist
                this.deleteFileChain(fileToWrite.tsbData);
                // we need to mark the first write point "inuse"
                this.write(fileToWrite.tsbData, "1---");
                // remove an extra space we bring in from shell command
                data = data.substring(0, data.length-1);
                // parse out any quotes if they were passed int
                data = this.parseQuotes(data);
                // first we need to know the first tsb location
                var meta:string = fileToWrite.tsbData;
                // now we loop through to write in "chunks"
                while(true){
                    // first get the first substring to write
                    var rest:string = data.substring(0, 60);
                    // set the rest for the next round
                    data = data.substring(60);
                    // if there is no more data just write the final part and get out of here
                    if(data.length <= 0){
                        this.write(meta, "1---" + rest);
                        break;
                    }else{ // otherwise
                        // get the next tsb
                        var next:string = this.findFreeDataTSB();
                        // write at the data location, in use, nexttsb and data
                        this.write(meta, "1"+next+rest);
                        // if we do not mark next in use, findFreeDataTSB() will fail us here
                        this.write(next, "1---");
                        // set meta to now be the next one
                        meta = next; 
                    }
                }
                // finally tell the user the file has been written.
                // TODO: change this to a boolean and then let the shell deal with it.
                return true;
            }
        }
        
        /**
         * A function to read a files contents and display
         */
        public readFile(name:string):string{
            // is the drive formatted? if not bail
            if(!this.isFormatted){
                _StdOut.putText("The drive is not formatted");
                return;
            }
            // does the file exist ?
            var fileToRead:File = this.lookupFileName(name);
            if(fileToRead === null){
                _StdOut.putText("File not found...oh no!");
            }else{ // otherwise
               
                // first we need a return string, the starting meta
                // and a var for the data we read.
                var fullstring:string = ""; 
                var readData:string;
                var nextmeta:string = fileToRead.tsbData;
                
                while(true){
                    // get the data from the meta location            
                    readData = this.read(nextmeta);
                    // mark --- or the next location to read
                    nextmeta = readData.substring(1,4);
                    // build our return string
                    fullstring = fullstring + readData.substring(4);
                    // if --- we can exit: TODO: move this to while condidtion
                    if(nextmeta === "---"){
                        break;
                    }
                }
                // print out the text
               // _StdOut.putText(fullstring);
               return fullstring;
            }
        }
        
        /**
         * A function that "rolls out" a PCB to disk 
         */
        public rollOut(pcb:PCB){
            
            if(!this.isFormatted){
                _StdOut.putText("Cannot Swap, drive not formatted.");
                return;
            }
            this.swapfilecount++;
            this.create(".swap"+(this.swapfilecount));
            var mem_string:string = "";
            for(var i:number = 0; i < MAX_MEM_SPACE; i++){
                
                // so read returns a string BUT since I store as an INT and convert
                // to a string, 07 gets stored as 7 and read to HD as such, it should
                // read it as 07 then let rollIn() deal with it
                // this is not really pretty, but do not want to break anything else
                // I just want to graduate :)
                var checkString: string = _MemManager.read(i, pcb);
                if(!isNaN(parseInt(checkString)) && checkString.length < 2 && parseInt(checkString) !== 0){
                    checkString = "0" + checkString;
                }
                
                mem_string = mem_string + checkString;
            }
            this.writeFile(".swap"+this.swapfilecount, mem_string);
            pcb.location = Location.HARD_DISK;
            pcb.base = -1;
            pcb.limit = -1;
            pcb.swapname = ".swap"+this.swapfilecount;
            pcb.setPCBDisplay(_PCBdisplay);
        }
        
        /**
         * A function that "rolls in" a PCB from disk
         */
        public rollIn(pcb:PCB){
        
            // I am sure this could not happen
            if(!this.isFormatted){
                _StdOut.putText("Drive not formatted");
                return;
            }
            var part:number = _MemManager.allocate();
            if(part !== - 1){
                
                var s = pcb.swapname;
                pcb.base = _MemManager.memoryRanges[part].base;
                pcb.limit = _MemManager.memoryRanges[part].limit;
                
                var point:number = 0;
                var data:string = this.readFile(s);
                for(var i:number = 0; i < (data.length / 2); i++){
                    _MemManager.write(i, (data.charAt(point++) + data.charAt(point++)),pcb);
                }
                pcb.location = Location.IN_MEMORY;
                pcb.setPCBDisplay(_PCBdisplay);
                this.deleteFile(pcb.swapname);
            }
        }
        
        /**
         * A function to convert hex string to regular string
         */
        private hexToString(hexString:string):string{
            
            var converted:string = "";
            while(hexString.length > 0){
                converted = converted + String.fromCharCode(parseInt(hexString.substring(0,2), 16));
                hexString = hexString.substring(2);
            }
            return converted;
        }
        
        /** A function to look up a file name
         *
         */
        private lookupFileName(name:string):File{
            
            for(var i:number = 0; i < this.fileArray.length; i++){
                if(this.fileArray[i].name === name){
                    return this.fileArray[i];
                }
            }
            return null;
        }
        
        
        /**
         * A function that marks inuse flags - it will keep calling entire chain
         * TODO: I hate this...
         */
        private deleteFileChain(tsb:string){
            
            while(this.read(tsb).substring(1,4) !== "---"){
                var nexttsb = this.read(tsb).substring(1,4);
                this.write(tsb, "0000" + this.read(tsb).substring(4));
                tsb = nexttsb;
            }
            this.write(tsb, "0000" + this.read(tsb).substring(4));
        }
        
        /**
         * A function that looks for a free spot for file name
         */
        private findFreeTSB():string{
            
            for(var t:number = 0; t < 1; t++){
                for(var s:number = 0; s < this.SECTORS; s++){
                    for(var b:number = 0; b < this.BLOCKS; b++){
                        var tempFile = this.read(this.toStringTSB(t,s,b));
                        if(tempFile.charAt(0) === "0"){
                            this.driveFull = false;
                            return this.toStringTSB(0,s,b);
                        }
                    }
                }
            }
            return "-1"; // indicate no free TSB found.
        }
        
        /** 
         * A function that looks for a free data spot for files
         */
        private findFreeDataTSB():string{
        
            for(var t:number = 1; t < this.TRACKS; t++){
                for(var s:number = 0; s < this.SECTORS; s++){
                    for(var b:number = 0; b < this.BLOCKS; b++){
                        var tempFile = this.read(this.toStringTSB(t,s,b));
                        if(tempFile.charAt(0) === "0"){
                            this.driveFull = false;
                            return this.toStringTSB(t,s,b);
                        }
                    }
                }
            }
            return "-1"; // indicate no free TSB found.
        }
        
        private toStringTSB(t:number, s:number, b:number):string{
            return String(t) + String(s) + String(b);
        }
        
        /**
         * A function that creates an MBR
         */
        private createMBR(){
            this.write("000","1---MBR_BLOSSOM");
        }
        
        /**
         * Just so I do not need to type 64 zeros all the time - I just call this
         * TODO: tweak is so it is bytes - meta...so 60 maybe? not sure until we
         *       start to need the meta data
         */
        private zeros():string {
            var zero:string = "00";
            for(var i:number = 1; i < (this.BYTES_BLOCKS - this.meta); i++){
                zero = zero + "00";
            }
            return zero;
        }
        
        /**
         * A method to pad the number of zeros at the end of the string
         */
        private padZeros(toPad:string):string{
        
            while(toPad.length < ((this.BYTES_BLOCKS - this.meta) * 2)){
                toPad = toPad + "00";
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
         * A function to parse out quotes from an incoming string
         */
        private parseQuotes(quotedString:string):string{
            if(quotedString.charCodeAt(0) === 34){
                return quotedString.substring(1, quotedString.length-1);
            }else{
                return quotedString;
            }
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
        
        public updateHDDDisplay(tblElement: HTMLTableElement, tsb:string, data:string, meta:string):void{
               
            for(var i:number = 0; i < (tblElement.rows.length - 1); i++){
                
                var row = null;
                row = tblElement.rows[i];
                var rowcells = null;
                rowcells = row.cells;
                
                if(tsb === rowcells[0].innerHTML){
                    
                    rowcells[1].innerHTML = meta;
                    rowcells[2].innerHTML = data;
                    
                    break;
                }
            }
        }
        
        public setHDDDisplay(tblElement: HTMLTableElement):void{
        
            // first if table exists, delete it
            this.deleteHDDTable(tblElement);
         
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
        
        /**
         * Clear / delete HDD display table.
         */
        private deleteHDDTable(tblElement: HTMLTableElement):void{
            
            // so get the first row, if null then we do nothing
            // otherwise we delete all rows in the table. This
            // check is basically to ensure it is not the first time
            // the table is being initalized.
            var row = null;
            row = tblElement.rows[1];
            
            if(typeof row !== 'undefined'){
                for(var i:number = 0; i < 257; i++){
                    tblElement.deleteRow(1);
                }
            }
        }
        
             
    }
}