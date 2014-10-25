///<reference path="../globals.ts" />
///<reference path="../host/memory.ts" />
/* ------------
     MemoryManager.ts
     
     This has all the routines (methods) required for the MMU
     It communicates between the OS and hardware

     Requires globals.ts
     
     Author: D. Blossom
     ------------ */
    
module TSOS{
    export class MemoryManager {
    
        // Our memory, which will be an array.
        public memoryModule:Memory;
        // TODO: add a way to keep track of the 3 different address spaces
        //       need to know when one will be in use as to not overwrite
        //       a program that has not run yet -- not needed for project 1
        //       but will be a key part for project 2!!

        constructor() {
            // initialize our memory object.
            this.memoryModule = new Memory(new Array<number>());
        }
        
        /**
         * writes a "byte string" to a memory address then updates the display
         *
         * @ params - address: where to write
         * @ params - byte: what to write 
         */
        public write(address:number, byte:string):void{
            
            // just hard coding for now since we are only working with 0 - 255
            // if we try to write at address 256 we should toss an error
            // TODO: create a function that checks the range of incoming address.
            if(address > (MAX_MEM_SPACE - 1)){
                _KernelInterruptQueue.enqueue(new Interrupt(ILLEGAL_MEM_ACCESS, 0));
            }else{ // good to go!
                this.memoryModule.write(address, byte);
                this.updateMemoryCell(address,byte);
            }
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
        
            // same as write, just hard coding the max address for now
            // we cannot read from any address past 255.
            // TODO: create a function that checks the range of an address
            if(address > (MAX_MEM_SPACE - 1)){
                _KernelInterruptQueue.enqueue(new Interrupt(ILLEGAL_MEM_ACCESS, 0));
            }else{ // should be a valid address ... maybe 
                return this.memoryModule.read(address);
            }
        }
        
        /**
         * This will clear all memory.
         * TODO: Still not a fan of having clear() in "memory.ts" or the "system memory"
         *       clear is just clearRange(x,y) with all our memory... so why have both?
         */
         public clearAllMemory(){
             
             for(var i:number = 0; i < MAX_MEM_LOCATIONS; i++){
                 this.clearPartition(i);
             }
             // re-initalize the display
             this.initMemoryDisplay(_MemoryDisplay);
         }
         
        /**
         * This will clear a partition of memory
         * @params - the memory partition to clear
         */
         public clearPartition(partitionNumber:number){
             
             switch (partitionNumber){
                 
                 case 0: 
                     this.writeZeroToBlock(0, 255);
                     break;
                 case 1:
                     this.writeZeroToBlock(256, 511);
                     break;
                 case 2:
                     this.writeZeroToBlock(512, 768);
                     break;
                 default:
                     // TODO:
             }
         }
         
        /**
         * This will write zeros to whichever block
         */
         private writeZeroToBlock(start:number, end:number){
             for(; start < end; start++){
                 this.write(start, "00");
             }
         }
        
        /**
         * This updates the memory after it has been loaded
         * If  you have seen previous commits, all issues have been resovlved
         * @params -- both are meaning less right now.
         */
        public updateMemoryCell(address:number, data:string):void{
        
            // using the address, find the row and the cell that needs updatimg
            var row:number = Math.floor(address / 8);
            var cell:number = (address % 8) + 1;
            
            // grab the row
            var requestedRow = null;
            requestedRow = _MemoryDisplay.rows[row];
            
            // grab the cell
            var requestedCell = null;
            requestedCell = requestedRow.cells[cell];
            
            // finally update the cell
            requestedCell.innerHTML = data.toUpperCase();
        }
        
        /**
         * This initalizes memory display to all zeros
         */
        public initMemoryDisplay(tblElement: HTMLTableElement):void{
        
            // if a table exists, delete it for the new table
            this.deleteMemoryTable(tblElement);
            
            // variable for row, and row count to count the number of rows
            var row = null;
            var rowcount = 0;
            
            // loop through checking if a cell is a multiple of 8 then we need a new
            // row, create the new row and continue filling all cells.
            for(var i=0; i < MAX_MEM_SPACE; i++){
                if(i%8 === 0){
                    row = tblElement.insertRow(rowcount++);
                    row.insertCell(0).innerHTML = "$" + (("0000" + i.toString(16)).slice(-4)).toUpperCase();
                } 
                row.insertCell((i%8) + 1).innerHTML = "00";
            }
        }
        
        /**
         * Clear / delete memory table (all rows ... BYE).
         */
        private deleteMemoryTable(tblElement: HTMLTableElement):void{
            
            // so get the first row, if null then we do nothing
            // otherwise we delete all rows in the table. This
            // check is basically to ensure it is not the first time
            // the table is being initalized.
            var row = null;
            row = tblElement.rows[0];
            
            if(typeof row !== 'undefined'){
                for(var i:number = 0; i < (MAX_MEM_SPACE / 8); i++){
                    tblElement.deleteRow(0);
                }
            }
        }
    }
}