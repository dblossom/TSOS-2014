/* -------------------------
pcb.ts
A process control block
Keeps track of a processes current state.
Author: D. Blossom
------------------------ */
var TSOS;
(function (TSOS) {
    (function (State) {
        State[State["NEW"] = 0] = "NEW";
        State[State["RUNNING"] = 1] = "RUNNING";
        State[State["TERMINATED"] = 2] = "TERMINATED";
        State[State["WAIT"] = 3] = "WAIT";
        State[State["READY"] = 4] = "READY";
    })(TSOS.State || (TSOS.State = {}));
    var State = TSOS.State;

    var PCB = (function () {
        function PCB(base, limit) {
            // CPU State information
            // kept var names similar to CPU with slight difference for sanity.
            this.progCount = 0;
            this.ACC = 0;
            this.X_reg = 0;
            this.Y_reg = 0;
            this.Z_flag = 0;
            // increment the pid everytime we create a PCB
            // so we do not want to start at zero but rather
            // whatever the next number will be.
            PCB.pid++;

            // mark the base and limit
            this.base = base;
            this.limit = limit;
            this.currentState = 0 /* NEW */;
        }
        PCB.pid = 0;
        return PCB;
    })();
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
