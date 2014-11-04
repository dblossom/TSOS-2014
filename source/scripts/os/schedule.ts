
/* ------------
   Schedule.ts
   
   An object for references related to the CPU scheduling.

   Author: D. Blossom
   ------------ */
   
module TSOS{

    /**
     * These will in turn tell the schedule which routine (scheudle) to run
     * Thinking ahead to iP4 - so FCFS and Priority will not be working at this time
     * therefore commented out.
     */
    export enum ScheduleRoutine{ 
        RR, //, // round robin = 0
        FCFS //, // first come first served = 1
      //  PRIORITY // priority = 2
    }
    
    /**
     * A class (function) to handle cpu scheduling
     */
    export class Schedule{
        
        // which routine are we running (currently only support Round Robin)
        // however, we are setting up nicely for iP4
        public routine: ScheduleRoutine;
        public cpuCount:number;
        
        /**
         * The constructor not much to say here...
         * @params anyRoutine, the routine of this schedule
         */
        constructor(anyRoutine: ScheduleRoutine) {
        
            this.routine = anyRoutine;
            
            // so we can keep track of CPU use count
            // we will decrement this counter.
            if(this.routine === ScheduleRoutine.RR){
                this.cpuCount = _Quantum;
            }
        }
        
        /**
         * This function is what will determine which routine to run based on
         * the enum "routine" 
         */
        public go(){
            
            // what routine do we want?
            switch(this.routine){
                
                // Round Robing
                case ScheduleRoutine.RR:
                    this.roundRobin(_Quantum);
                    break;
                
                // First come first serve
                case ScheduleRoutine.FCFS:
                    this.firstCome();
                    break;
                
                // how the freak did we even get here?
                default:
                    // TODO: throw invalid schedule and toss a bsod
            }
        }
        
        /**
         * Round Robing scheduling routine
         */
        public roundRobin(quantum:number){
        
            if(_CPU.isExecuting){
            
                 // turn is over
                if(this.cpuCount === 0){
                
                    Control.hostLog("Quantum Expired, prepare for context switch", "OS");
                    // enqueue an interupt to change processes - handled by kernel
                    _KernelInterruptQueue.enqueue(new Interrupt(CON_SWITCH_IRQ, 0)); // not sure what I want to pass yet so just 0.
                    // get ready for the next guy .. or the same guy ..
                    this.cpuCount = quantum;

                }else{// turn is not over, keep swinging (that sounds dirty...)
                
                    // decrement the rr counter by one
                    this.cpuCount--;
                    // make a call to the CPU CYCLE.
                    _CPU.cycle();
                }
            } 
        }
        
        /**
         * First come first serve scheduling routine
         */
        public firstCome(){
            
            // if the quantum count is zero, give me 1 more go!
            if(this.cpuCount === 0){
                this.cpuCount++;
            }
            
            // pass a high value into round robin routine to make it
            // seem like FCFS
            this.roundRobin(9999);
        }   
    }
}