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

                default:
            }
        };

        Schedule.prototype.roundRobin = function (quantum) {
            if (_CPU.isExecuting) {
                // turn is over
                if (this.cpuCount === 0) {
                    // enqueue an interupt to change processes - handled by kernel
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CON_SWITCH_IRQ, 0)); // not sure what I want to pass yet so just 0.

                    // get ready for the next guy .. or the same guy ..
                    this.cpuCount = _Quantum;
                } else {
                    // decrement the rr counter by one
                    this.cpuCount--;

                    // make a call to the CPU CYCLE.
                    _CPU.cycle();
                }
            } else if (_KernelReadyQueue.getSize() > 0) {
                // so I sort of do something at process end that might eliminate the need for this here.
            }
        };
        return Schedule;
    })();
    TSOS.Schedule = Schedule;
})(TSOS || (TSOS = {}));
