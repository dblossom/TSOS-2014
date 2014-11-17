///<reference path="deviceDriver.ts" />
/* ----------------------------------
DeviceDriverHDD.ts
Requires deviceDriver.ts
The Kernel Hard Disk Drive Device Driver.
Author Dan Blossom
---------------------------------- */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverHDD = (function (_super) {
        __extends(DeviceDriverHDD, _super);
        function DeviceDriverHDD() {
            _super.call(this, this.setDriverEntry(), this.setISR()); // just some BS to compile
        }
        DeviceDriverHDD.prototype.setDriverEntry = function () {
            this.status = "loaded";
        };

        DeviceDriverHDD.prototype.setISR = function () {
        };

        DeviceDriverHDD.prototype.setHDDDisplay = function (tblElement) {
            // only seems to work if we create a null first ... (?)
            var row = null;

            var track = 0;
            var sector = 0;
            var block = -1;

            while (true) {
                row = tblElement.insertRow(-1);

                block++;

                if (block === 8) {
                    block = 0;
                    sector++;
                }
                if (sector === 8) {
                    sector = 0;
                    track++;
                }
                if (track === 4) {
                    break;
                }

                var temp = "" + track + sector + block;

                row.insertCell(0).innerHTML = temp;

                row.insertCell(1).innerHTML = "0.0.0";
                row.insertCell(2).innerHTML = "0000000000000000000000000000000000000000000000000000000000000000";
            }
        };
        return DeviceDriverHDD;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverHDD = DeviceDriverHDD;
})(TSOS || (TSOS = {}));
