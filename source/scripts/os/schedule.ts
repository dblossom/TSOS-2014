
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
        
        /**
         * The constructor not much to say here...
         * @params anyRoutine, the routine of this schedule
         */
        constructor(anyRoutine: ScheduleRoutine) {
            this.routine = anyRoutine;
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
            // empty shell
        }
        
    }
    
}