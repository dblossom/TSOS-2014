///<reference path="../globals.ts" />

/* ------------
     Memory.ts
     
     This is a memory representation of hardware.

     Requires globals.ts
     
     Author: D. Blossom

     ------------ */

module TSOS{

    /*
     * This class represents memory as a hardware device
     * it contains functions to initialize a new memory address
     * read, write, clearall, and clear a block of managed memory
     */
    
    export class Memory{
        
        constructor(public memoryArray:Array<number>){
            
        }
        
        public write(address:number, hexbyte:string):void{
            // so this at its very basic form will put a "hex byte" in a memory location
            this.memoryArray[address] = parseInt(hexbyte,16); //store as int.
        }
        
        /**
         * This will read contents from memory
         */
        public read(address:number):string{
            // so this will read an item from memory
            return this.memoryArray[address].toString(16); //bring it back as string
        }
        
        /**
         * returns the size of length of memory
         */
        public size():number{
            return this.memoryArray.length;
        }
    }
}