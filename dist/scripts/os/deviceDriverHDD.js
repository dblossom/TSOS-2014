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
        /**
        * The constructor for our HDD driver
        */
        function DeviceDriverHDD() {
            _super.call(this, this.setDriverEntry(), this.setISR()); // just some BS to compile
        }
        /**
        * The set driver entry function
        * Set the track, sector, block, set local storage, stuff like that...
        */
        DeviceDriverHDD.prototype.setDriverEntry = function () {
            if (this.supports_html5_storage()) {
                // init the vars: could not do it above ... why?
                this.TRACKS = 4;
                this.SECTORS = 8;
                this.BLOCKS = 8;
                this.BYTES_BLOCKS = 64;
                this.HardDriveArray = window.localStorage;

                this.status = "loaded";
            } else {
                //TODO: error
            }
        };

        DeviceDriverHDD.prototype.setISR = function () {
        };

        /**
        * A method that will return if the browser supports html5 storage...
        * Modified from original version: http://diveintohtml5.info/storage.html
        */
        DeviceDriverHDD.prototype.supports_html5_storage = function () {
            try  {
                return 'localStorage' in window && window['localStorage'] !== null;
            } catch (e) {
                return false;
            }
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
