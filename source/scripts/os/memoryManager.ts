///<reference path="../globals.ts" />
///<reference path="../host/memory.ts" />


/* ------------
     MemoryManager.ts

     Requires globals.ts

     ------------ */
    
module TSOS{
    export class MemoryManager {
    
        public memoryModule:Memory; // our memory
        public BLOCK_SIZE:number = 256; // our max block size - global?
        public AVAIL_LOCATIONS:number = 3; // number of locations for programs - global?
        public MAX: number = (this.BLOCK_SIZE * this.AVAIL_LOCATIONS); // max mem location - global?

        constructor() {
        
            this.memoryModule = new Memory(new Array<number>());
            
            // this should give us our address ranges starting with zero
            //  so - if all goes to plan, we will have 3 elements with
            // (0, 255) (256, 511) (512, 768) ... only time will tell.
            for(var i:number = 0; i < this.MAX; i = (i + this.BLOCK_SIZE)){
              //  this.avail_mem.push(i, (i + (this.BLOCK_SIZE - 1)));
            } 
        
        }
        
        public write(address:number, byte:string):void{
            this.memoryModule.write(address, byte);
            this.updateMemoryCell(address,byte);
        }
        
        /**
         * Will read contents (if any) from a location in memory given an address
         *
         * TODO: consider returning a NUMBER vs STRING since we are storing NUMBER.
         *
         * @param address - the address of the content of memory
         * @return string - a string representation of what is in memory
         */
        public read(address:number):string{
            return this.memoryModule.read(address);
        }
        
        public clearRange(start:number, end:number):void{
            this.memoryModule.clearBlock(start, end);
        }
        
        /**
         * This updates the memory after it has been loaded
         * @params -- both are meaning less right now.
         */
        public updateMemoryCell(address:number, data:string):void{
        
        //    var row:number = Math.floor(address / 8);
            
        //    var cell:number = (address % 8) + 1; // skip header
            
            // *** ANGRY COMMENTS RANT, NOT FULLY RELEVENT TO CODE
            // *******************************************************************
            // Because typescript casts all these damn table objects as elements we
            // run into a lot of "xxx" does not exist on type element...
            // hours wasted looking for a work around to stick to "typescript"
            
            // LENGTH IS NOT EVEN CORRECT WHAT THE FUCK FUCK FUCK
            // SO WTF AM I DOING TO FIX THIS SHIT .... AHHHHHH
            // *** END ************************************************************
            
            // TODO: <-- first the todo so everyone knows, I know what fuck is wrong
            //       need static variables of course, and ranges and blah fucking blah.
            
            // my bandaid hack...
            
            // first we delete every row (even rows.length did not work right!)
            // since I am only showing 255 until I get this working right, hard code
            // the 32 (31) rows in the 255... so ... then delete the first row, which
            // is always zero because well, once a row is gone its child becomes parent. 
            for(var i:number = 0; i < 32; i++){
                _MemoryDisplay.deleteRow(0);
            }
            
           var row = null;
            var rowcount = 0;
            
            // now let us loop through, re-inserting all the rows and cells
            // lucky for us, all memory will be inialized to 00 so there will always
            // be something in every slow, so this works with minimal garbage fucking code
            for (var i:number = 0; i < this.memoryModule.size(); i++){
                if(i%8 === 0){
                    row = _MemoryDisplay.insertRow(rowcount++);
                    row.insertCell(0).innerHTML = "$" + (("0000" + i.toString(16)).slice(-4)).toUpperCase();
                }
               row.insertCell((i%8) + 1).innerHTML = (("00" + this.memoryModule.read(i)).slice(-2)).toUpperCase();
            }

            

           
        
        }
        
        /**
         * This initalizes memory to all zeros -> hmm sure looks like the guy abvoe
         * next release will have 1 method that works for both
         */
        public initMemoryDisplay(tblElement: HTMLTableElement):void{
            
            var row = null;
            var rowcount = 0;
            for(var i=0; i < 256; i++){
                if(i%8 === 0){
                    row = tblElement.insertRow(rowcount++);
                    row.insertCell(0).innerHTML = "$" + (("0000" + i.toString(16)).slice(-4)).toUpperCase();
                } 
                row.insertCell((i%8) + 1).innerHTML = "00";
            }
        }
    }
}