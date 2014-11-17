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
            _super.call(this, 0, 1); // just some BS to compile
        }
        DeviceDriverHDD.prototype.setHDDDisplay = function (tblElement) {
            // only seems to work if we create a null first ... (?)
            var row = null;

            // insert a row "on top" of the others
            row = tblElement.insertRow(-1);

            // set the cell with the new state information
            // the order matters here!
            row.insertCell(0).innerHTML = "0.0.0";
            row.insertCell(1).innerHTML = "1";
            row.insertCell(2).innerHTML = "2";
        };
        return DeviceDriverHDD;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverHDD = DeviceDriverHDD;
})(TSOS || (TSOS = {}));
