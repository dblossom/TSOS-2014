/* ------------------------

       memoryManager.ts
       
    A MMU or memory manager
    
    Author: D. Blossom
    
    ----------------------- */
    
module TSOS{

    export class MemoryManager{
    
        public memoryModule:Memory; // our memory
        public BLOCK_SIZE:number = 256;
    
        constructor(){
        
            this.memoryModule = new Memory(new Array<HexByte>());
        
        }
    
    
    }


}