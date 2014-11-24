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
                _StdOut.putText("Hard drive not mounted, failed to load, please contact vendor.");
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
            // Be warned, we are swarming in if/else / if / else
            // it is ugly and gets a bit too deep for my personal likings
            // with that said ...
            // TODO: clean up the IF's!
            // first let us remove any quotes that might have been passed
            name = this.parseQuotes(name);

            // if the hard drive is not full, it is formatted and a file name does not exist
            if (!this.isFormatted) {
                _StdOut.putText("The drive is not formatted");
            } else if (!this.driveFull && (this.lookupFileName(name) === null)) {
                // find some free space for this file name
                var freeData = this.findFreeDataTSB();

                // we should not get here .. but if we do
                if (freeData === "-1") {
                    _StdOut.putText("Hard drive is full, no more room for you");
                } else {
                    // let us mark it in use and set the meta to point to its first data point
                    var tempmeta = "1" + freeData;

                    // let us find a place to put this file - ugh this is confusing.
                    var temptsb = this.findFreeTSB();

                    // okay there was room for it ...
                    if (temptsb !== "-1") {
                        // write to the tsb, the meta then append the name
                        this.write(temptsb, (tempmeta + name));

                        // let us mark the data "in use" and no links yet
                        this.write(tempmeta.substring(1), "1---");

                        // store the file name, its tsb and its first data tsb for easy lookup
                        this.fileArray.unshift(new TSOS.File(name, temptsb, tempmeta.substring(1)));

                        // return that it happened
                        return true;
                    } else {
                        // hard drive is full, return false
                        _StdOut.putText("Hard drive is full, no more room for you!");
                        return false;
                    }
                }
            } else {
                // we are either full, not formatted or file exists - we should not hit that last else LOL ...
                if (this.driveFull) {
                    _StdOut.putText("Drive Full.");
                } else if (!this.lookupFileName(name) === null) {
                    _StdOut.putText("Filename exists");
                } else {
                    _StdOut.putText("Something went wrong, and I am not sure what...sorry.");
                }

                // file was not created!
                return false;
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

                    this.fileArray.splice(i, 1);

                    return true;
                }
            }
        };

        /**
        * A function to write data to a file
        */
        DeviceDriverHDD.prototype.writeFile = function (name, data) {
            // Not proud of some of these checks
            // if the drive is not formated, bail...
            if (!this.isFormatted) {
                _StdOut.putText("The drive is not formatted!!");
                return;
            }

            // does the file exists?
            var fileToWrite = this.lookupFileName(name);
            if (fileToWrite === null) {
                _StdOut.putText("File does not exist.");
            } else {
                // first we need to delete the chain of text that might exist
                this.deleteFileChain(fileToWrite.tsbData);

                // we need to mark the first write point "inuse"
                this.write(fileToWrite.tsbData, "1---");

                // remove an extra space we bring in from shell command
                data = data.substring(0, data.length - 1);

                // parse out any quotes if they were passed int
                data = this.parseQuotes(data);

                // first we need to know the first tsb location
                var meta = fileToWrite.tsbData;

                while (true) {
                    // first get the first substring to write
                    var rest = data.substring(0, 30);

                    // set the rest for the next round
                    data = data.substring(30);

                    // if there is no more data just write the final part and get out of here
                    if (data.length <= 0) {
                        this.write(meta, "1---" + rest);
                        break;
                    } else {
                        // get the next tsb
                        var next = this.findFreeDataTSB();

                        // write at the data location, in use, nexttsb and data
                        this.write(meta, "1" + next + rest);

                        // if we do not mark next in use, findFreeDataTSB() will fail us here
                        this.write(next, "1---");

                        // set meta to now be the next one
                        meta = next;
                    }
                }

                // finally tell the user the file has been written.
                _StdOut.putText("File has been written");
            }
        };

        /**
        * A function to read a files contents and display
        */
        DeviceDriverHDD.prototype.readFile = function (name) {
            // is the drive formatted? if not bail
            if (!this.isFormatted) {
                _StdOut.putText("The drive is not formatted");
                return;
            }

            // does the file exist ?
            var fileToRead = this.lookupFileName(name);
            if (fileToRead === null) {
                _StdOut.putText("File not found...oh no!");
            } else {
                // first we need a return string, the starting meta
                // and a var for the data we read.
                var fullstring = "";
                var readData;
                var nextmeta = fileToRead.tsbData;

                while (true) {
                    // get the data from the meta location
                    readData = this.read(nextmeta);

                    // mark --- or the next location to read
                    nextmeta = readData.substring(1, 4);

                    // build our return string
                    fullstring = fullstring + readData.substring(4);

                    // if --- we can exit: TODO: move this to while condidtion
                    if (nextmeta === "---") {
                        break;
                    }
                }

                // print out the text
                _StdOut.putText(fullstring);
            }
        };

        /**
        * A function to convert hex string to regular string
        */
        DeviceDriverHDD.prototype.hexToString = function (hexString) {
            var converted = "";
            while (hexString.length > 0) {
                converted = converted + String.fromCharCode(parseInt(hexString.substring(0, 2), 16));
                hexString = hexString.substring(2);
            }
            return converted;
        };

        /** A function to look up a file name
        *
        */
        DeviceDriverHDD.prototype.lookupFileName = function (name) {
            for (var i = 0; i < this.fileArray.length; i++) {
                if (this.fileArray[i].name === name) {
                    return this.fileArray[i];
                }
            }
            return null;
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
        * A function to parse out quotes from an incoming string
        */
        DeviceDriverHDD.prototype.parseQuotes = function (quotedString) {
            if (quotedString.charCodeAt(0) === 34) {
                return quotedString.substring(1, quotedString.length - 1);
            } else {
                return quotedString;
            }
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
            // first if table exists, delete it
            this.deleteHDDTable(tblElement);

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

        /**
        * Clear / delete HDD display table.
        */
        DeviceDriverHDD.prototype.deleteHDDTable = function (tblElement) {
            // so get the first row, if null then we do nothing
            // otherwise we delete all rows in the table. This
            // check is basically to ensure it is not the first time
            // the table is being initalized.
            var row = null;
            row = tblElement.rows[1];

            if (typeof row !== 'undefined') {
                for (var i = 0; i < 257; i++) {
                    tblElement.deleteRow(1);
                }
            }
        };
        return DeviceDriverHDD;
    })(TSOS.DeviceDriver);
    TSOS.DeviceDriverHDD = DeviceDriverHDD;
})(TSOS || (TSOS = {}));
