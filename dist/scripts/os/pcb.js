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
            this.pidNumber = PCB.pid++;

            // mark the base and limit
            this.base = base;
            this.limit = limit;
            this.currentState = 0 /* NEW */;
        }
        /**
        * Method to initalize PCB display to all zeros
        * This ASSUMES PCB variables have been set!
        */
        PCB.prototype.setPCBDisplay = function (tblElement) {
            // So, I am passing in a PCB which in each call ends up being that PCB
            // I should probably just call "this" on the methods below...
            // for some reason, this seems to work best when we first set to "null"
            var row = null;

            // get the "active" row, which will always be row 1, row 0 is reserved for header
            row = tblElement.rows[this.pidNumber + 1];

            // get the cells within row 1.
            var cellsInRow = null;
            cellsInRow = row.cells;

            // set the cell with the new state information
            // the order matters here!
            cellsInRow[0].innerHTML = this.pidNumber.toString();
            cellsInRow[1].innerHTML = this.base.toString();
            cellsInRow[2].innerHTML = this.limit.toString();
            cellsInRow[3].innerHTML = State[this.currentState].toString();
            cellsInRow[4].innerHTML = this.progCount.toString();
            cellsInRow[5].innerHTML = this.ACC.toString();
            cellsInRow[6].innerHTML = this.X_reg.toString();
            cellsInRow[7].innerHTML = this.Y_reg.toString();
            cellsInRow[8].innerHTML = this.Z_flag.toString();
        };

        /**
        * Will add a new row the the table for display of PCB information
        */
        PCB.prototype.pcbNewRow = function (tblElement) {
            // only seems to work if we create a null first ... (?)
            var row = null;

            // insert a row "on top" of the others
            row = tblElement.insertRow(PCB.pid);

            //these have to be in the correct order!
            row.insertCell(0).innerHTML = (PCB.pid - 1).toString();
            row.insertCell(1).innerHTML = this.base.toString();
            row.insertCell(2).innerHTML = this.limit.toString();
            row.insertCell(3).innerHTML = State[this.currentState].toString();
            row.insertCell(4).innerHTML = this.progCount.toString();
            row.insertCell(5).innerHTML = this.ACC.toString();
            row.insertCell(6).innerHTML = this.X_reg.toString();
            row.insertCell(7).innerHTML = this.Y_reg.toString();
            row.insertCell(8).innerHTML = this.Z_flag.toString();
        };
        PCB.pid = 0;
        return PCB;
    })();
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
