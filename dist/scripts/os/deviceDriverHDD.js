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
                // how many tracks
                this.TRACKS = 4;

                // how many sectors
                this.SECTORS = 8;

                // how many blocks
                this.BLOCKS = 8;

                // how many bytes per block
                this.BYTES_BLOCKS = 64;

                // meta data -- (in use, t, s, b) === 4
                this.meta = 4;

                // where we will store our stuff.
                this.HardDriveArray = window.localStorage;

                // sure why not.
                this.status = "loaded";

                // hhd starts off unformatted
                this.isFormatted = false;
            } else {
                //TODO: error
            }
        };

        /**
        * sets the ISR - currently serves no purpose
        */
        DeviceDriverHDD.prototype.setISR = function () {
        };

        /**
        * A method to write data to the disk
        * @param track, sector, block - corresponds to location to write
        *        data is what to write
        */
        DeviceDriverHDD.prototype.write = function (track, sector, block, data) {
            var key = String(track) + String(sector) + String(block);
            this.HardDriveArray.setItem(key, data);
            this.updateHDDDisplay(_HDDdisplay, track, sector, block, this.padZeros(data));
        };

        /**
        * A method to read and return what is at a location on disk'
        * @param track, sector, block - where to read
        * @return what is there, whether you agree or not.
        */
        DeviceDriverHDD.prototype.read = function (track, sector, block) {
            var key = String(track) + String(sector) + String(block);
            return this.HardDriveArray.getItem(key);
        };

        /**
        * A method to format the hard-disk-drive
        */
        DeviceDriverHDD.prototype.format = function () {
            if (!this.supports_html5_storage()) {
                return (this.isFormatted = false);
            } else {
                for (var t = 0; t < this.TRACKS; t++) {
                    for (var s = 0; s < this.SECTORS; s++) {
                        for (var b = 0; b < this.BLOCKS; b++) {
                            this.write(t, s, b, this.zeros());
                        }
                    }
                }
                return (this.isFormatted = true);
            }
        };

        /**
        * Just so I do not need to type 64 zeros all the time - I just call this
        * TODO: tweak is so it is bytes - meta...so 60 maybe? not sure until we
        *       start to need the meta data
        */
        DeviceDriverHDD.prototype.zeros = function () {
            var zero = "0";
            for (var i = 1; i < (this.BYTES_BLOCKS - this.meta); i++) {
                zero = zero + "0";
            }
            return zero;
        };

        /**
        * A method to pad the number of zeros at the end of the string
        */
        DeviceDriverHDD.prototype.padZeros = function (toPad) {
            while (toPad.length < (this.BYTES_BLOCKS - this.meta)) {
                toPad = toPad + "0";
            }

            return toPad;
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

        DeviceDriverHDD.prototype.updateHDDDisplay = function (tblElement, t, s, b, data) {
            var TSB = String(t) + String(s) + String(b);

            for (var i = 0; i < (tblElement.rows.length - 1); i++) {
                var row = null;
                row = tblElement.rows[i];
                var rowcells = null;
                rowcells = row.cells;

                if (TSB === rowcells[0].innerHTML) {
                    rowcells[2].innerHTML = data;

                    break;
                }
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

                row.insertCell(1).innerHTML = "000";
                row.insertCell(2).innerHTML = "0000000000000000000000000000000000000000000000000000000000000000";
            }

            this.write(0, 0, 1, "hi");
            //  this.write(0,0,5,"bye");
        };
        return DeviceDriverHDD;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverHDD = DeviceDriverHDD;
})(TSOS || (TSOS = {}));
