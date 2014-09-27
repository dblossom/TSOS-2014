/* -------------------------
       pcb.ts
       
    A process control block
    
    Author: D. Blossom
    
    ------------------------ */
    
module TSOS{

    export class PCB{
    
        // we need to increment everytime
        public static pid:number = 0;
        
        // CPU State information
        // kept var names similar to CPU with slight difference for sanity.
        public progCount: number = 0;
        public ACC: number = 0;
        public X_reg: number = 0;
        public Y_reg: number = 0;
        public Z_flag: number = 0;
        
        // base and limit information
        public base: number;
        public limit: number;
        
        constructor(base:number, limit:number){
            // increment the pid everytime we create a PCB
            // so we do not want to start at zero but rather
            // whatever the next number will be.
            PCB.pid++;
            
            // mark the base and limit
            this.base = base;
            this.limit = limit;

        }
    
    
    }

}