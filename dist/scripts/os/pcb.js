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
        State[State["WAITING"] = 3] = "WAITING";
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
        /**
        * Method to initalize PCB display to all zeros
        * This ASSUMES PCB variables have been set!
        * TODO: Add typescript like and create new row  upon new PCB.
        *       It will take some redisign of index file.
        */
        PCB.prototype.setPCBDisplay = function () {
            document.getElementById('PID').innerHTML = (PCB.pid - 1).toString();
            document.getElementById('Base').innerHTML = this.base.toString();
            document.getElementById('Limit').innerHTML = this.limit.toString();
            document.getElementById('State').innerHTML = State[this.currentState].toString();
            document.getElementById('pcb_PC').innerHTML = this.progCount.toString();
            document.getElementById('pcb_ACC').innerHTML = this.ACC.toString();
            document.getElementById('pcb_X').innerHTML = this.X_reg.toString();
            document.getElementById('pcb_Y').innerHTML = this.Y_reg.toString();
            document.getElementById('pcb_Z').innerHTML = this.Z_flag.toString();
        };
        PCB.pid = 0;
        return PCB;
    })();
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
