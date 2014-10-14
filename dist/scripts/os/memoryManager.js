///<reference path="../globals.ts" />
///<reference path="../host/memory.ts" />
/* ------------
MemoryManager.ts
This has all the routines (methods) required for the MMU
It communicates between the OS and hardware
Requires globals.ts
Author: D. Blossom
------------ */
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        // TODO: add a way to keep track of the 3 different address spaces
        //       need to know when one will be in use as to not overwrite
        //       a program that has not run yet -- not needed for project 1
        //       but will be a key part for project 2!!
        function MemoryManager() {
            // initialize our memory object.
            this.memoryModule = new TSOS.Memory(new Array());
        }
        /**
        * writes a "byte string" to a memory address then updates the display
        *
        * @ params - address: where to write
        * @ params - byte: what to write
        */
        MemoryManager.prototype.write = function (address, byte) {
            // just hard coding for now since we are only working with 0 - 255
            // if we try to write at address 256 we should toss an error
            // TODO: create a function that checks the range of incoming address.
            if (address > (MAX_MEM_SPACE - 1)) {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(ILLEGAL_MEM_ACCESS, 0));
            } else {
                this.memoryModule.write(address, byte);
                this.updateMemoryCell(address, byte);
            }
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
            // same as write, just hard coding the max address for now
            // we cannot read from any address past 255.
            // TODO: create a function that checks the range of an address
            if (address > (MAX_MEM_SPACE - 1)) {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(ILLEGAL_MEM_ACCESS, 0));
            } else {
                return this.memoryModule.read(address);
            }
        };

        /**
        * Will clear a section of memory given a starting address and "offset" or end address
        * @ param start: where to start
        * @ param end: where to ... well ... wait for it ... END
        */
        MemoryManager.prototype.clearRange = function (start, end) {
            this.memoryModule.clearBlock(start, end);
        };

        /**
        * This updates the memory after it has been loaded
        * If  you have seen previous commits, all issues have been resovlved
        * @params -- both are meaning less right now.
        */
        MemoryManager.prototype.updateMemoryCell = function (address, data) {
            // using the address, find the row and the cell that needs updatimg
            var row = Math.floor(address / 8);
            var cell = (address % 8) + 1;

            // grab the row
            var requestedRow = null;
            requestedRow = _MemoryDisplay.rows[row];

            // grab the cell
            var requestedCell = null;
            requestedCell = requestedRow.cells[cell];

            // finally update the cell
            requestedCell.innerHTML = data.toUpperCase();
        };

        /**
        * This initalizes memory to all zeros
        */
        MemoryManager.prototype.initMemoryDisplay = function (tblElement) {
            // if a table exists, delete it for the new table
            this.deleteMemoryTable(tblElement);

            // variable for row, and row count to count the number of rows
            var row = null;
            var rowcount = 0;

            for (var i = 0; i < MAX_MEM_SPACE; i++) {
                if (i % 8 === 0) {
                    row = tblElement.insertRow(rowcount++);
                    row.insertCell(0).innerHTML = "$" + (("0000" + i.toString(16)).slice(-4)).toUpperCase();
                }
                row.insertCell((i % 8) + 1).innerHTML = "00";
            }
        };

        /**
        * Clear / delete memory table (all rows ... BYE).
        */
        MemoryManager.prototype.deleteMemoryTable = function (tblElement) {
            // so get the first row, if null then we do nothing
            // otherwise we delete all rows in the table. This
            // check is basically to ensure it is not the first time
            // the table is being initalized.
            var row = null;
            row = tblElement.rows[0];

            if (typeof row !== 'undefined') {
                for (var i = 0; i < (MAX_MEM_SPACE / 8); i++) {
                    tblElement.deleteRow(0);
                }
            }
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
