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
        }
        
        public clearRange(start:number, end:number):void{
            this.memoryModule.clearBlock(start, end);
            new Control().initMemoryDisplay(_MemoryDisplay);
        }
        
        public displayMemoryContents():void{
        
            var row = null;
            var rowcount = 0;
            for (var i:number = 0; i < this.memoryModule.size(); i++){
                if(i%8 === 0){
                    row = _MemoryDisplay.insertRow(rowcount++);
                    row.insertCell(0).innerHTML = "$" + (("0000" + i.toString(16)).slice(-4)).toUpperCase();
                }
                row.insertCell((i%8) + 1).innerHTML = (("00" + this.memoryModule.read(i)).slice(-2)).toUpperCase();
            }
            
            
          //  for(var i=0; i < 768; i++){
               // if(i%8 === 0){
                 //   row = TableElement.insertRow(rowcount++);
               //     row.insertCell(0).innerHTML = "$" + (("0000" + i.toString(16)).slice(-4)).toUpperCase();
             //   } 
           //     row.insertCell((i%8) + 1).innerHTML = "00";
          //  }
        
        }
    
    
    }


}