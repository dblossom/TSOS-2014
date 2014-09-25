///<reference path="../globals.ts" /> // might not need

// --------------------------------
//    hexByte.ts
//     
//    Class to represent a hex byte.
//    Nothing fancy just ensure our memory "array" only takes
//    in a byte in hex (2 hex chars as 1 is only a nibble <-- nipple?
//    
//    TODO: consider creating a Byte class, then extend that here...
//
//    Author Dan Blossom

module TSOS{

    /*
     * A class that will represent a Hex Byte for our memory hardware
     * basically it is just a sring with a length of 2 wrapped up.
     */
    export class HexByte{
    
        // what we set the "hex string"
        public hexByte:string = "";
    
        // so we take a string and check if it is of length 2
        // if not we disgard it -- otherwise we set our string
        constructor(hex:string){
            if(hex.length === 2){
                this.hexByte = hex;
            }  
        }
        
        /*
         * Because we might want to represent our string as a string ;)
         */
        public toString():string{
            return this.hexByte;
        }
    
    }
}