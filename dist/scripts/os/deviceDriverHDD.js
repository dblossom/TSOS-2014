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
            _super.call(this, this.setDriverEntry(), this.setISR());
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
        DeviceDriverHDD.prototype.write = function (tsb, data) {
            this.HardDriveArray.setItem(tsb, data);

            // for clarity
            var metaS = data.substring(0, 4);
            var dataS = data.substring(4);

            // update the display
            this.updateHDDDisplay(_HDDdisplay, tsb, this.padZeros(this.stringToHex(dataS)), metaS);
        };

        /**
        * A method to read and return what is at a location on disk'
        * @param track, sector, block - where to read
        * @return what is there, whether you agree or not.
        */
        DeviceDriverHDD.prototype.read = function (tsb) {
            return this.HardDriveArray.getItem(tsb);
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
                            this.write(this.toStringTSB(t, s, b), "0000" + this.zeros());
                        }
                    }
                }
                this.setHDDDisplay(_HDDdisplay);
                this.createMBR();

                // set the file array
                this.fileArray = new Array();

                // we do not start full...
                this.driveFull = false;
                return (this.isFormatted = true);
            }
        };

        /**
        * A function that creates an empty file
        */
        DeviceDriverHDD.prototype.create = function (name) {
            if (!this.driveFull) {
                var freeData = this.findFreeDataTSB();

                //TODO: check for -1
                var tempmeta = "1" + freeData;

                var temptsb = this.findFreeTSB();

                if (temptsb !== "-1") {
                    this.write(temptsb, (tempmeta + name));

                    this.write(tempmeta.substring(1), "1---");

                    this.fileArray.unshift(new TSOS.File(name, temptsb, tempmeta.substring(1)));

                    return true;
                } else {
                    //TODO:
                    return false;
                }
            } else {
                //TODO: throw an IRQ
            }
        };

        /**
        * A functioin that deletes a file and all its contents
        */
        DeviceDriverHDD.prototype.deleteFile = function (name) {
            for (var i = 0; i < this.fileArray.length; i++) {
                if (this.fileArray[i].name === name) {
                    var tsb = this.fileArray[i].tsb;

                    this.deleteFileChain(this.fileArray[i].tsbData);

                    this.write(tsb, "0---" + this.read(tsb).substring(4));

                    return true;
                }
            }
        };

        /**
        * A function that marks inuse flags - it will keep calling entire chain
        * TODO: I hate this...
        */
        DeviceDriverHDD.prototype.deleteFileChain = function (tsb) {
            while (this.read(tsb).substring(1, 4) !== "---") {
                var nexttsb = this.read(tsb).substring(1, 4);
                this.write(tsb, "0000" + this.read(tsb).substring(4));
                tsb = nexttsb;
            }
            this.write(tsb, "0000" + this.read(tsb).substring(4));
        };

        /**
        * A function that looks for a free spot for file name
        */
        DeviceDriverHDD.prototype.findFreeTSB = function () {
            for (var t = 0; t < 1; t++) {
                for (var s = 0; s < this.SECTORS; s++) {
                    for (var b = 0; b < this.BLOCKS; b++) {
                        var tempFile = this.read(this.toStringTSB(t, s, b));
                        if (tempFile.charAt(0) === "0") {
                            this.driveFull = false;
                            return this.toStringTSB(0, s, b);
                        }
                    }
                }
            }
            return "-1";
        };

        /**
        * A function that looks for a free data spot for files
        */
        DeviceDriverHDD.prototype.findFreeDataTSB = function () {
            for (var t = 1; t < this.TRACKS; t++) {
                for (var s = 0; s < this.SECTORS; s++) {
                    for (var b = 0; b < this.BLOCKS; b++) {
                        var tempFile = this.read(this.toStringTSB(t, s, b));
                        if (tempFile.charAt(0) === "0") {
                            this.driveFull = false;
                            return this.toStringTSB(t, s, b);
                        }
                    }
                }
            }
            return "-1";
        };

        DeviceDriverHDD.prototype.toStringTSB = function (t, s, b) {
            return String(t) + String(s) + String(b);
        };

        DeviceDriverHDD.prototype.setNextDataTSB = function () {
            this.currentFileDataBlock++;

            if (this.currentFileDataBlock === 8) {
                this.currentFileDataBlock = 0;
                this.currentFileDataSector++;
            }

            if (this.currentFileDataSector === 8) {
                this.currentFileDataSector = 0;
                this.currentFileDataTrack++;
            }

            if (this.currentFileDataTrack === 4) {
                this.driveFull = true;
            }
        };

        /**
        * A function that creates an MBR
        */
        DeviceDriverHDD.prototype.createMBR = function () {
            this.write("000", "1---MBR_BLOSSOM");
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
        * A function that will convert strings to hex... cool.
        */
        DeviceDriverHDD.prototype.stringToHex = function (fromString) {
            var toHex = "";

            for (var i = 0; i < fromString.length; i++) {
                var toHex = toHex + fromString.charCodeAt(i).toString(16);
            }
            return toHex;
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

        DeviceDriverHDD.prototype.updateHDDDisplay = function (tblElement, tsb, data, meta) {
            for (var i = 0; i < (tblElement.rows.length - 1); i++) {
                var row = null;
                row = tblElement.rows[i];
                var rowcells = null;
                rowcells = row.cells;

                if (tsb === rowcells[0].innerHTML) {
                    rowcells[1].innerHTML = meta;
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

                row.insertCell(1).innerHTML = "0000";
                row.insertCell(2).innerHTML = this.zeros();
            }
        };
        return DeviceDriverHDD;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverHDD = DeviceDriverHDD;
})(TSOS || (TSOS = {}));
