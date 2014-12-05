///<reference path="../globals.ts" />
/* ------------
harddrive.ts
HardDrive a representation of a physical disk "hardware"
Requires globals.ts (actually ... )
Author: D. Blossom
------------ */
var TSOS;
(function (TSOS) {
    var HardDrive = (function () {
        function HardDrive(harddrive) {
            if (typeof harddrive === "undefined") { harddrive = window.sessionStorage; }
            this.harddrive = harddrive;
        }
        HardDrive.prototype.write = function (tsb, data) {
            this.harddrive.setItem(tsb, data);
        };

        HardDrive.prototype.read = function (tsb) {
            return this.harddrive.getItem(tsb);
        };
        return HardDrive;
    })();
    TSOS.HardDrive = HardDrive;
})(TSOS || (TSOS = {}));
