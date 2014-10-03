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
        };

        MemoryManager.prototype.clearRange = function (start, end) {
            this.memoryModule.clearBlock(start, end);
            new TSOS.Control().initMemoryDisplay(_MemoryDisplay);
        };

        MemoryManager.prototype.displayMemoryContents = function () {
            var row = null;
            var rowcount = 0;
            for (var i = 0; i < this.memoryModule.size(); i++) {
                if (i % 8 === 0) {
                    row = _MemoryDisplay.insertRow(rowcount++);
                    row.insertCell(0).innerHTML = "$" + (("0000" + i.toString(16)).slice(-4)).toUpperCase();
                }
                row.insertCell((i % 8) + 1).innerHTML = this.memoryModule.read(i);
            }
            //  for(var i=0; i < 768; i++){
            // if(i%8 === 0){
            //   row = TableElement.insertRow(rowcount++);
            //     row.insertCell(0).innerHTML = "$" + (("0000" + i.toString(16)).slice(-4)).toUpperCase();
            //   }
            //     row.insertCell((i%8) + 1).innerHTML = "00";
            //  }
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
