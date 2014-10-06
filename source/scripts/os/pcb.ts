/* -------------------------
    pcb.ts
       
    A process control block
    
    Keeps track of a processes current state.
    
    Author: D. Blossom
    ------------------------ */
    
module TSOS{

    export enum State{ 
            NEW, // new = 0
            RUNNING, // running = 1
            TERMINATED, // terminated = 2
            WAIT, // waiting = 3
            READY // ready = 4
    }

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
        public currentState: State; 
        
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
            this.currentState = State.NEW;
        }
    }
}