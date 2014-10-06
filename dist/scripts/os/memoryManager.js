///<reference path="../globals.ts" />
///<reference path="../host/memory.ts" />
/* ------------
MemoryManager.ts
Requires globals.ts
------------ */
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager() {
            this.BLOCK_SIZE = 256;
            this.AVAIL_LOCATIONS = 3;
            this.MAX = (this.BLOCK_SIZE * this.AVAIL_LOCATIONS);
            this.memoryModule = new TSOS.Memory(new Array());

            for (var i = 0; i < this.MAX; i = (i + this.BLOCK_SIZE)) {
                //  this.avail_mem.push(i, (i + (this.BLOCK_SIZE - 1)));
            }
        }
        MemoryManager.prototype.write = function (address, byte) {
            this.memoryModule.write(address, byte);
            this.updateMemoryCell(address, byte);
        };

        /**
        * Will read contents (if any) from a location in memory given an address
        *
        * TODO: consider returning a NUMBER vs STRING since we are storing NUMBER.
        *
        * @param address - the address of the content of memory
        * @return string - a string representation of what is in memory
        */
        MemoryManager.prototype.read = function (address) {
            return this.memoryModule.read(address);
        };

        MemoryManager.prototype.clearRange = function (start, end) {
            this.memoryModule.clearBlock(start, end);
        };

        /**
        * This updates the memory after it has been loaded
        * @params -- both are meaning less right now.
        */
        MemoryManager.prototype.updateMemoryCell = function (address, data) {
            for (var i = 0; i < 32; i++) {
                _MemoryDisplay.deleteRow(0);
            }

            var row = null;
            var rowcount = 0;

            for (var i = 0; i < this.memoryModule.size(); i++) {
                if (i % 8 === 0) {
                    row = _MemoryDisplay.insertRow(rowcount++);
                    row.insertCell(0).innerHTML = "$" + (("0000" + i.toString(16)).slice(-4)).toUpperCase();
                }
                row.insertCell((i % 8) + 1).innerHTML = (("00" + this.memoryModule.read(i)).slice(-2)).toUpperCase();
            }
        };

        /**
        * This initalizes memory to all zeros -> hmm sure looks like the guy abvoe
        * next release will have 1 method that works for both
        */
        MemoryManager.prototype.initMemoryDisplay = function (tblElement) {
            var row = null;
            var rowcount = 0;
            for (var i = 0; i < 256; i++) {
                if (i % 8 === 0) {
                    row = tblElement.insertRow(rowcount++);
                    row.insertCell(0).innerHTML = "$" + (("0000" + i.toString(16)).slice(-4)).toUpperCase();
                }
                row.insertCell((i % 8) + 1).innerHTML = "00";
            }
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
