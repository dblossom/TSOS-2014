//
//    ----------------------------------------------
//    Memory.ts
//    Requires globals.ts < actually not sure yet >
//
//    Routines for memory hardware simulation
//
//    
//    Author: Dan Blossom
//    ----------------------------------------------

module TSOS{

    /*
     * This class represents memory has a hardware device
     * it contains functions to initialize a new memory address
     * read, write, clearall, and clear a block of managed memory
     */
    
    export class Memory{
        
        constructor(public memoryArray:Array<number>){
            
        }
        
        public write(address:number, hexbyte:string):void{
            // so this at its very basic form will put a "hex byte" in a memory location
            this.memoryArray[address] = parseInt(hexbyte,16); 
        }
        
        /**
         * This will read contents from memory
         */
        public read(address:number):string{
            // so this will read an item from memory
            return this.memoryArray[address].toString(16); 
        }
        
        /**
         * This will clear a "block" of memory
         */
        public clearBlock(start_address:number, end_address:number):void{
        
            // are we even within a valid memory range ?
            if((start_address !== 0 ||
               start_address !== 256 ||
               start_address !== 512) &&
               (end_address !== 255 ||
                end_address !== 511 ||
                end_address !== 768)){
                
                for(; start_address < end_address; start_address++){
                    this.memoryArray[start_address] = parseInt("00", 16);
                }
                
            }
        }
        
        /**
         * This will clear all memory - zero machine memory!
         */
        public clear():void{
            this.clearBlock(0, 768);
        }
        
        /**
         * This will initalize a new memory to all zeros
         * Same as clear but with a name like init() people will call it
         * to initialize an array
         *
         * TODO: remove clear all and hope people are smart enough to "init" for clearning memory
         */
        public init():void{
            //this.memoryArray = new Array<HexByte>();
            this.clearBlock(0,768); // <-- call clearBlock() because we might deprecate clear()
                                    //     but we would not deprecate clearBlock as that seems  useful
        }
    }
}