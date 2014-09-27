/* -------------------------
pcb.ts
A process control block
Author: D. Blossom
------------------------ */
var TSOS;
(function (TSOS) {
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
        }
        PCB.pid = 0;
        return PCB;
    })();
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
