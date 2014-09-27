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
        public progCount: number;
        public ACC: number;
        public X_reg: number;
        public Y_reg: number;
        public Z_flag: number;
        
        constructor(){
            // increment the pid everytime we create a PCB
            // so we do not want to start at zero but rather
            // whatever the next number will be.
            PCB.pid++;
            
            // init the cpu state info to zero
            this.progCount = 0;
            this.ACC = 0;
            this.X_reg = 0;
            this.Y_reg = 0;
            this.Z_flag = 0;
        }
    
    
    }

}