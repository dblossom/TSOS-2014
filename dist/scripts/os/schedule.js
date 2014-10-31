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
            // empty shell
        };
        return Schedule;
    })();
    TSOS.Schedule = Schedule;
})(TSOS || (TSOS = {}));
