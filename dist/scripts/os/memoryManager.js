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
            this.avail_mem = new Array();
            this.memoryModule = new TSOS.Memory(new Array());

            for (var i = 0; i < this.MAX; i = (i + this.BLOCK_SIZE)) {
                this.avail_mem.push(i, (i + (this.BLOCK_SIZE - 1)));
            }
        }
        MemoryManager.prototype.write = function (address, byte) {
            this.memoryModule.write(address, byte);
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
