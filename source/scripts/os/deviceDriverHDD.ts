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
        public HardDriveArray:HardDrive;
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
        // to make the swap file name unique.
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
                this.HardDriveArray = new HardDrive();
                // sure why not.
                this.status = "loaded";
                // hhd starts off unformatted
                this.isFormatted = false;

            }else{ // something went wrong, more than likly the browser does not support HTML 5 storage
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
            // this actually puts the item in our key value store...
            this.HardDriveArray.write(tsb, data);
            
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
            // give me the key and I shall give you the value.
            return this.HardDriveArray.read(tsb);
        }
        
        /**
         * A method to format the hard-disk-drive
         */
        public format():boolean{
            // well if we do not support html5 ... ? 
            if(!this.supports_html5_storage()){
                return (this.isFormatted = false);
            // here is a very simple n^3 algo.
            // basically just set everything to zeros.
            }else{
                for(var t:number = 0; t < this.TRACKS; t++){
                    for(var s:number = 0; s < this.SECTORS; s++){
                        for(var b:number = 0; b < this.BLOCKS; b++){
                            this.write(this.toStringTSB(t,s,b), "0000" + this.zeros());
                        }
                    }
                }
                // okay, update the display with zeros and such.
                this.setHDDDisplay(_HDDdisplay);
                // update the MBR ... wait update the display first ?
                // does not matter really ... write updates display too... so...
                this.createMBR();
                // set the file array
                // here is where we can get easy and fast access about our files... 
                this.fileArray = new Array<File>();
                // we do not start full...
                this.driveFull = false;
                // keep track of swap files
                // I wanted the naming scheme to be .swapN n being some number...
                // no reason other than it means more than some other non-sense I could have done.
                this.swapfilecount = 0;
                // set the flag to true and return it.
                return (this.isFormatted = true);
            }
        }
        
        /**
         * A function that creates an empty file
         */
        public create(name:string):boolean{
        
            // Be warned, we are swarming in if/else / if / else
            // I did try to clean them up a little bit ... comments might help
        
            // first let us remove any quotes that might have been passed
            name = this.parseQuotes(name);
            
            // first off are we formatted? 
            if(!this.isFormatted){
                _StdOut.putText("The drive is not formatted");
                return false;
            }
            
            // does this file exist?
            if(this.lookupFileName(name) !== null){
                _StdOut.putText("Umm...file exists already");
                return false;
            }
            
            // is the drive full ?
            if(!this.driveFull){
                // find some free space for this file name
                var freeData = this.findFreeDataTSB();
                // we should not get here .. but if we do
                if(freeData === "-1"){
                    _StdOut.putText("Hard drive is full, no more room for you");
                    return false;
                // we have at least 64 bytes for data for this file...
                }else{
                    // let us mark it in use and set the meta to point to its first data point
                    var tempmeta = "1" + freeData;
                    // let us find a place to put this file - THAT IS THE NAME, NOT its data.
                    var temptsb = this.findFreeTSB();
                    // a "-1" indicates NO ROOM... Should check first before data ...
                    if(temptsb !== "-1"){
                        // write to the tsb, the meta then append the name
                        this.write(temptsb, (tempmeta + name));
                        // let us mark the data "in use" and no links yet
                        this.write(tempmeta.substring(1), "1---");
                        // store the file name, its tsb and its first data tsb for easy lookup
                        this.fileArray.unshift(new File(name, temptsb ,tempmeta.substring(1)));
                        // return that it happened            
                        return true;
                    // there is no room for the file name ... so we just abort.
                    }else{
                        // hard drive is full, return false
                        _StdOut.putText("Hard drive is full, no more room for you!");
                        return false;
                    }
                }
            }else{
                // we are either full, or file exists - we should not hit that last else LOL ...
                if(this.driveFull){
                    _StdOut.putText("Drive Full.");
                    return false;
                }else{
                    _StdOut.putText("Something went wrong, and I am not sure what...sorry.");
                    return false;
                }
            }        
        }
        
        /**
         * A functioin that deletes a file and all its contents
         */
        public deleteFile(name:string):boolean{
        
            // first off is the drive formatted or are we extra worried ... ?
            if(!this.isFormatted){
                _StdOut.putText("The drive is not formatted");
                return false;
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
                return false;
            }
            // does the file exists?
            var fileToWrite:File = this.lookupFileName(name);
            if(fileToWrite === null){
                _StdOut.putText("File does not exist.");
                return false;
            }
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
                    // get the next tsb: TODO: what if full ? will crash and burn here HARD!
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
            return true;
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
                return;
            }   
            // first we need a return string, the starting meta
            // and a var for the data we read.
            var fullstring:string = ""; 
            var readData:string;
            var nextmeta:string = fileToRead.tsbData;
            // now loop through the chain of links finding the data    
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
        
        /**
         * A function that "rolls out" a PCB to disk 
         * @params the pcb to send to disk
         * @params program? so this is more for internal "bandaid"
         *         if noting is provided, it will assume program is in memory
         *         check the pcb's memory location and grab the program ... 
         *         if supplied (like when loading) it will use that instead of checking RAM.
         */
        public rollOut(pcb:PCB, program?){
            
            // first off, we cannot swap if not formatted...
            if(!this.isFormatted){
                _StdOut.putText("Cannot Swap, drive not formatted.");
                return;
            }
            // this is for my filename ".swapN" N being a number.
            this.swapfilecount++;
            // create the file name
            this.create(".swap"+(this.swapfilecount));
            // the string we are going to build
            var mem_string:string = "";
            // SO: if no param is passed, we hope the program is in RAM
            //     actually we assume it is in ram and I am NOT responsible
            //     for the crash that WILL happen!
            if(typeof program === 'undefined'){
                for(var i:number = 0; i < MAX_MEM_SPACE; i++){
                    // so read returns a string BUT since I store as an INT and convert
                    // to a string, 07 gets stored as 7 and read to HD as such, it should
                    // read it as 07 then let rollIn() deal with it
                    // this is not really pretty, but do not want to break anything else
                    // so I will deal with the issue here ... esp since ...
                    // I just want to graduate :)
                    var checkString: string = _MemManager.read(i, pcb);
                    if(!isNaN(parseInt(checkString)) && checkString.length < 2){
                        // just pad a zero
                        checkString = "0" + checkString;
                    }
                    // okay, so it is possible to bring in one character...need to pad
                    if(checkString.length === 1){
                        checkString = "0" + checkString;
                    }
                    
                    // finally build the string
                    mem_string = mem_string + checkString;
                }
            }else{
                // we passed a paramater, we are going to pad that to the memory block size.
                while(program.length < MAX_MEM_SPACE){
                    program = program + "0";
                }
                // now set the string we are rolling out
                mem_string = program;
            }
            // since write file is created correctly (kinda) we can use that ... simple!
            this.writeFile(".swap"+this.swapfilecount, mem_string);
            // set the new PCB location
            pcb.location = Location.HARD_DISK;
            // it has no "base" per se... 
            pcb.base = -1;
            // it has no limit ...
            pcb.limit = -1;
            // let us keep the name handy for speed! 
            pcb.swapname = ".swap"+this.swapfilecount;
        }
        
        /**
         * A function that "rolls in" a PCB from disk
         * @param the PCB to roll in
         */
        public rollIn(pcb:PCB){
        
            // I am sure this could not happen
            // have I been saying this a lot ?
            if(!this.isFormatted){
                _StdOut.putText("Drive not formatted");
                return;
            }
            // so we will create a function called swap() in schedule
            // that will deal with if there is no free memory...
            // actually we might want to consider moving rollOut() and rollIn() to schedule...
            var part:number = _MemManager.allocate();
            // assume we got a partition ... if not, I guess toss a BSOD or IDK
            if(part !== - 1){
                // assign the base
                pcb.base = _MemManager.memoryRanges[part].base;
                // assign the limit
                pcb.limit = _MemManager.memoryRanges[part].limit;
                // start a pointer to loop through the data
                var point:number = 0;
                // get the data from the HD
                var data:string = this.readFile(pcb.swapname);
                // similar ... actually (copy and paste) from load..
                // writes the pcb into memory
                for(var i:number = 0; i < (data.length / 2); i++){
                    _MemManager.write(i, (data.charAt(point++) + data.charAt(point++)),pcb);
                }
                // update the pcb that it is in memory
                pcb.location = Location.IN_MEMORY;
                // free the hard_drive space is not that cheap!
                this.deleteFile(pcb.swapname);
            }else{
                //TODO: catch / error upon no memory to roll into.
            }
        }
        
        /**
         * A function to convert hex string to regular string
         * @ param the string to convert
         */
        private hexToString(hexString:string):string{
            // the string we have converted
            var converted:string = "";
            // loop over the string ...
            while(hexString.length > 0){
                // substring first char, make it an int in base 10, then back to its char
                converted = converted + String.fromCharCode(parseInt(hexString.substring(0,2), 16));
                // trim
                hexString = hexString.substring(2);
            }
            // return
            return converted;
        }
        
        /** 
         * A function to look up a file name
         */
        private lookupFileName(name:string):File{
            // loop through our file name array
            for(var i:number = 0; i < this.fileArray.length; i++){
                if(this.fileArray[i].name === name){
                    return this.fileArray[i];
                }
            }
            // return null, indicating File is empty... a/k/a does not exist.
            return null;
        }
        
        /**
         * A function that marks inuse flags - it will keep calling entire chain
         * TODO: I hate this...(actually not that bad).
         */
        private deleteFileChain(tsb:string){
            // this just says, while we do not have a pointer..
            while(this.read(tsb).substring(1,4) !== "---"){
                // get the next pointer
                var nexttsb = this.read(tsb).substring(1,4);
                // set this pointer to 0000 - which means not in use, no pointer
                this.write(tsb, "0000" + this.read(tsb).substring(4));
                // set current to the next one we grabbed earlier.
                tsb = nexttsb;
            }
            // finally write the last one to be "reset"
            this.write(tsb, "0000" + this.read(tsb).substring(4));
        }
        
        /**
         * A function that looks for a free spot for file name
         */
        private findFreeTSB():string{
            
            // nice little n^3 run here _ like format
            // we are just going to look through each TSB
            // from 000 - 077 (could skip the MBR but whatever)
            // we limit to that range for the file name...
            for(var t:number = 0; t < 1; t++){
                for(var s:number = 0; s < this.SECTORS; s++){
                    for(var b:number = 0; b < this.BLOCKS; b++){
                        var tempFile = this.read(this.toStringTSB(t,s,b));
                        // if we find a free spot ... 
                        if(tempFile.charAt(0) === "0"){
                            // in case this flag was set ... why would it be ?
                            this.driveFull = false;
                            // and return the location ... so maybe not exactly n^3
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
            // exactly the same as findFreeTSB() except
            // we are looking for (100 - 377) data range
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
        
        /**
         * A simple toString() kind of method that will create a string
         * out of three numerical values for TSB
         */
        private toStringTSB(t:number, s:number, b:number):string{
            return String(t) + String(s) + String(b);
        }
        
        /**
         * A function that creates an MBR
         */
        private createMBR(){
            // IDK, got something better I could write
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
            // the string we will convert
            var toHex:string = "";
            // loop over making hex and appending!
            for(var i:number = 0; i < fromString.length; i++){
                var toHex = toHex + fromString.charCodeAt(i).toString(16);
            }
            return toHex;
        }
        
        /**
         * A function to parse out quotes from an incoming string
         */
        private parseQuotes(quotedString:string):string{
            // if the first has a quote
            if(quotedString.charCodeAt(0) === 34){
                // we assume there is a quote in the last spot too... should probably just check for that
                return quotedString.substring(1, quotedString.length-1);
            }else{
                // just pass the string back
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
        
        /**
         * This will update the HDD display
         */
        public updateHDDDisplay(tblElement: HTMLTableElement, tsb:string, data:string, meta:string):void{
            
            // for every row    
            for(var i:number = 0; i < (tblElement.rows.length - 1); i++){
                // start with null
                var row = null;
                // pass in the rows
                row = tblElement.rows[i];
                // get the cells for that row
                var rowcells = null;
                rowcells = row.cells;
                // if there is a match
                if(tsb === rowcells[0].innerHTML){
                    // update the meta area
                    rowcells[1].innerHTML = meta;
                    // update the data area
                    rowcells[2].innerHTML = data;
                    // bye
                    break;
                }
            }
        }
        
        /**
         * This will set the HDD display to all zeros!
         */
        public setHDDDisplay(tblElement: HTMLTableElement):void{
        
            // first if table exists, delete it
            this.deleteHDDTable(tblElement);
         
            // only seems to work if we create a null first ... (?)
            var row = null;
            // our starting points
            var track:number = 0;
            var sector:number = 0;
            var block:number = -1;
            
            while(true){
                // insert a new row
                row = tblElement.insertRow(-1);
                // increment the block
                block++;
                // if block is 8 we are ready to inc the sector
                if(block === 8){
                    block = 0;
                    sector++;
                }
                // if sector is 8 we are ready to inc the track
                if(sector === 8){
                    sector = 0;
                    track++;
                }
                // if the track is 4 ... well we should have 000 - 377
                if(track === 4){
                    break;
                }
                // quickly convert to a string ... (why not use your toString() method?)
                var temp = "" + track + sector + block;
                // insert the TSB location for cell 0
                row.insertCell(0).innerHTML = temp;
                // insert the meta data for cell 1
                row.insertCell(1).innerHTML = "0000";
                // pad with zeros for cell2
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