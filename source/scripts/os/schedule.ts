
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
        RR //, // round robin = 0
      //  FCFS, // first come first served = 1
      //  PRIORITY // priority = 2
    }
    
    /**
     * A class (function) to handle cpu scheduling
     */
    export class Schedule{
        
        // which routine are we running (currently only support Round Robin)
        // however, we are setting up nicely for iP4
        public routine: ScheduleRoutine;
        private cpuCount:number;
        
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
                
                
                // how the freak did we even get here?
                default:
                    // TODO: throw invalid schedule and toss a bsod
            }
        }
        
        
        public roundRobin(quantum:number){
        
            if(_CPU.isExecuting){
            
                 // turn is over
                if(this.cpuCount === 0){
                    // enqueue an interupt to change processes - handled by kernel
                    _KernelInterruptQueue.enqueue(new Interrupt(CON_SWITCH_IRQ, 0)); // not sure what I want to pass yet so just 0.
                    // get ready for the next guy .. or the same guy ..
                    this.cpuCount = _Quantum;
                }else{// turn is not over, keep swinging (that sounds dirty...)
                
                    // decrement the rr counter by one
                    this.cpuCount--;
                    // make a call to the CPU CYCLE.
                    _CPU.cycle();
                }
            }else if(_KernelReadyQueue.getSize() > 0){ // if there is still stuff to do, one process ended, is there another?
                alert("hello");
            }   
        }   
    }
}