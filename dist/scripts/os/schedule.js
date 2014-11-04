/* ------------
Schedule.ts
An object for references related to the CPU scheduling.
Author: D. Blossom
------------ */
var TSOS;
(function (TSOS) {
    /**
    * These will in turn tell the schedule which routine (scheudle) to run
    * Thinking ahead to iP4 - so FCFS and Priority will not be working at this time
    * therefore commented out.
    */
    (function (ScheduleRoutine) {
        ScheduleRoutine[ScheduleRoutine["RR"] = 0] = "RR";
        ScheduleRoutine[ScheduleRoutine["FCFS"] = 1] = "FCFS";
    })(TSOS.ScheduleRoutine || (TSOS.ScheduleRoutine = {}));
    var ScheduleRoutine = TSOS.ScheduleRoutine;

    /**
    * A class (function) to handle cpu scheduling
    */
    var Schedule = (function () {
        /**
        * The constructor not much to say here...
        * @params anyRoutine, the routine of this schedule
        */
        function Schedule(anyRoutine) {
            this.routine = anyRoutine;

            // so we can keep track of CPU use count
            // we will decrement this counter.
            if (this.routine === 0 /* RR */) {
                this.cpuCount = _Quantum;
            }
        }
        /**
        * This function is what will determine which routine to run based on
        * the enum "routine"
        */
        Schedule.prototype.go = function () {
            switch (this.routine) {
                case 0 /* RR */:
                    this.roundRobin(_Quantum);
                    break;

                case 1 /* FCFS */:
                    this.firstCome();
                    break;

                default:
            }
        };

        /**
        * Round Robing scheduling routine
        */
        Schedule.prototype.roundRobin = function (quantum) {
            if (_CPU.isExecuting) {
                // turn is over
                if (this.cpuCount === 0) {
                    TSOS.Control.hostLog("Quantum Expired, prepare for context switch", "OS");

                    // enqueue an interupt to change processes - handled by kernel
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CON_SWITCH_IRQ, 0)); // not sure what I want to pass yet so just 0.

                    // get ready for the next guy .. or the same guy ..
                    this.cpuCount = quantum;
                } else {
                    // decrement the rr counter by one
                    this.cpuCount--;

                    // make a call to the CPU CYCLE.
                    _CPU.cycle();
                }
            }
        };

        /**
        * First come first serve scheduling routine
        */
        Schedule.prototype.firstCome = function () {
            // if the quantum count is zero, give me 1 more go!
            if (this.cpuCount === 0) {
                this.cpuCount++;
            }

            // pass a high value into round robin routine to make it
            // seem like FCFS
            this.roundRobin(9999);
        };
        return Schedule;
    })();
    TSOS.Schedule = Schedule;
})(TSOS || (TSOS = {}));
