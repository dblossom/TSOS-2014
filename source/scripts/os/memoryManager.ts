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
        // An array that will tell us about our free ranges of memory.
        public memoryRanges = new Array<MemoryRange>();

        constructor() {
            // initialize our memory object.
            this.memoryModule = new Memory(new Array<number>());
            // initalize our memory locations
            this.initMemoryRanges(this.memoryRanges);
        }
        
        /**
         * writes a "byte string" to a memory address then updates the display
         *
         * @ params - address: where to write
         * @ params - byte: what to write 
         */
        public write(address:number, byte:string, pcb:PCB):void{

            // so we want to write within our bounds
            // otherwise throw an interrupt
            if(address + pcb.base > pcb.limit ||
               address + pcb.base < pcb.base) {
                _KernelInterruptQueue.enqueue(new Interrupt(ILLEGAL_MEM_ACCESS, 0));
            }else{ // good to go!
                this.memoryModule.write((address + pcb.base), byte);
                this.updateMemoryCell(address + pcb.base,byte);
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
        public read(address:number, pcb:PCB):string{
        
            // just like write, we want to ensure we are only reading memory we have access too
            if(address + pcb.base > pcb.limit ||
               address + pcb.base < pcb.base){
                _KernelInterruptQueue.enqueue(new Interrupt(ILLEGAL_MEM_ACCESS, 0));
            }else{ // should be a valid address ... maybe 
                return this.memoryModule.read(address + pcb.base);
            }
        }
        
        /**
         * Allocate memory to a given PCB
         * @return - the free memory location
         *           (-)1 indicates no mem to allocate
         */
        public allocate():number{
            // assume no free space
            var partition: number = -1;
            // loop through the list of ranges trying to find an open space
            for(var i:number = 0; i < this.memoryRanges.length; i++){
                // if inuse is false, we can use it
                if(this.memoryRanges[i].inuse === false){
                    // what partition are we in?
                    partition = i;
                    // clearn the memory ... do we clear in load too ? whatever
                    this.clearPartition(i);
                    // do not let anyone else use this until we are done
                    this.memoryRanges[i].inuse = true;
                    // leave the loop, got what we came for
                    break;
                }
            }
            // FINALLY, where is that free space ... or -1 if none.
            return partition;
        }
        
        /**
         * Deallocate memory for a given PCB
         */
        public deallocate(pcb: PCB){
            
            // what was the base of the PCB
            var base:number = pcb.base;
            // given that base, find the object in our memory range array
            for(var i:number = 0; i < this.memoryRanges.length; i++){
                // okay, found it - now set it for someone else to use...
                // NOT clearing memory here so we can see it on the display
                if(this.memoryRanges[i].base === base){
                    this.memoryRanges[i].inuse = false;
                }
            }
        }
        
        /**
         * This will clear all memory.
         * TODO: Still not a fan of having clear() in "memory.ts" or the "system memory"
         *       clear is just clearRange(x,y) with all our memory... so why have both?
         */
         public clearAllMemory(){
             
             // for each block of memory, clear it ...
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
         
             // so set the range to no longer be in use so another process can have it
             this.memoryRanges[partitionNumber].inuse = false;
             
             // given a partition number (0, 1 or 2) clear that block
             switch (partitionNumber){
                 
                 case 0: 
                     this.writeZeroToBlock(0, 255);
                     break;
                 case 1:
                     this.writeZeroToBlock(256, 511);
                     break;
                 case 2:
                     this.writeZeroToBlock(512, 767);
                     break;
                 default:
                     // TODO: invalid partition error -- maybe a print to screen or IRQ ?
             }
         }
         
        /**
         * Retuns if there is available memory
         */
         public memoryAvailable():boolean{
             // Assume no free memory
             var returnBool: boolean = false;
             
             // similar to allocate, loop our ranges looking for a false inuse boolean
             for(var i:number = 0; i < this.memoryRanges.length; i++){
                 // if we find one, set our return boolean to true and bust outta this loop
                 if(this.memoryRanges[i].inuse === false){
                     returnBool = true;
                     break;
                 }
             }
             // finally, return what happened
             return returnBool;
         }
         
         /**
          * This will write zeros to whichever block
          * TODO: consider making this public
          */
         private writeZeroToBlock(start:number, end:number){
             // I mean given a start and end, it will put 00 in that block of memory locations
             for(; start < end+1; start++){
                 this.memoryModule.write(start, "00");
                 this.updateMemoryCell(start, "00");
             }
         }
        
        /**
         * This updates the memory after it has been loaded
         * If  you have seen previous commits, all issues have been resovlved
         * @params address to updated, data to put there
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
            for(var i=0; i < MAX_ADDRESS_SPACE; i++){
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
        
        /**
         * Initalizes our free memory ranges and sets them all to available
         */
        private initMemoryRanges(memoryRanges:Array<MemoryRange>){
            
            // for however many blocks of memory we want, push a range ...
            // we could in theory have 4, 5, 6, whatever blocks of memory.
            for(var i:number = 0; i < MAX_ADDRESS_SPACE; i += MAX_MEM_SPACE){
                
                this.memoryRanges.push(new MemoryRange(false, i, (i + (MAX_MEM_SPACE - 1))));

            }
        }
        
    }
}