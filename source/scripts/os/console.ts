///<reference path="../globals.ts" />

/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell.  The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {
    
        // to hold buffer commands after enter is pressed
        public commandHistory:string[] = [];
        public commandHistoryPointer:number = this.commandHistory.length;
        
        public tabSearchResults:string[] = [];
        public tabSearchPointer:number = 0;

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "") {

        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        private clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        private resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        // TODO: with all these "else if" might be time to consider something else?
        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { //     Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    
                    // put it in our command history
                    // increase our pointer to last element
                    this.commandHistory[this.commandHistory.length] = this.buffer;
                    this.commandHistoryPointer = this.commandHistory.length - 1;
                    
                    // clear the tab buffer and pointer
                    this.tabSearchResults = [];
                    this.tabSearchPointer = 0;
                           
                    // ... and reset our buffer.
                    this.buffer = "";
                }else if(chr === "up" || chr === "down"){
                    
                    // first let us clear the buffer
                    this.buffer = "";
                
                    // will we or will we not use this command?
                    // either way ... I am calling it a command
                    var tempCommand:string = this.commandRecall(chr);
                    
                    // show the "user" the command
                    this.putText(tempCommand);
                    
                    // in case we use this command - put it in buffer
                    this.buffer = tempCommand;
                
                //backspace
                }else if(chr === String.fromCharCode(8)){
                    
                    // grab the active buffer
                    var currBuff: string = this.buffer;
                    // substring it
                    currBuff = currBuff.substring(0, (currBuff.length-1));
					
					// erase the entire line
                    this.clearLine();
                    
                    // put the text back minus one char
                    this.putText(currBuff);
                    
                    // reset the buffer dumbass
                    this.buffer = currBuff;          
                    
                }else if(chr === String.fromCharCode(9)){
                
                    if(this.tabSearchResults.length > 0){
                        
                        // we want to loop around so if we are at the end of array start over
                        if(this.tabSearchPointer === this.tabSearchResults.length){
                            this.tabSearchPointer = 0;
                        }
                        // grab the next item from the array and put it in the buffer and on screen
                        var tempString:string = this.tabSearchResults[this.tabSearchPointer++];
                        this.clearLine();
                        this.putText(tempString);
                        this.buffer = tempString;
                        
                    }else{ // this is the "first" time tab is being pushed
                    
                        // set the array with the found results
                        this.tabSearchResults = this.commandLookup(this.buffer);
                        // set the pointer, but it should be set already 
                        this.tabSearchPointer = 0;
                        // grab the first result
                        var tempString:string = this.tabSearchResults[this.tabSearchPointer++];
                        // clear the buffer
                        this.buffer = "";
                        // erase the line
                        this.clearLine();
                        // finally show the text and put in the the buffer in case it will be used.        
                        this.putText(tempString);
                        this.buffer = tempString;   
                    }
                    
                }else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
                //       What do we want ctrl-c to do?
            }
        }

        public putText(text): void {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
                        
            if (text !== "") {
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                
                if((this.currentXPosition + offset) > _Canvas.width){
                    var wordList:string[] = text.split(" ");

                    for(var i:number = 0; i < wordList.length; i++){
                        // So, by spliting on space we lose the breaks between words...
                        // I tried to add a space at the end of ever for-loop with 
                        // .drawText() - that did not seem to work no fucking idea why
                        // so - for every word just add a space -- this is fucking dumb
                        wordList[i] += " ";
                    
                        var len:number = _DrawingContext.measureText(this.currentFont, this.currentFontSize, wordList[i]);
                        if((len + this.currentXPosition) > _Canvas.width){
                            // next line
                            this.advanceLine();
                       }
                        _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, wordList[i]);
                        this.currentXPosition += len;
                    }
                }else{
                // Draw the text at the current X and Y coordinates.
                    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                    this.currentXPosition = this.currentXPosition + offset;
                }
            }
         }
        
        // simply put the function advances a line - we added rollover support which we are calling scroll
        public advanceLine(): void {
            this.currentXPosition = 0;
            this.currentYPosition += _DefaultFontSize + _FontHeightMargin;

            if(this.currentYPosition > _Canvas.height){
                // past max canvas height, bump a line "scroll"
                // see function for details.
                this.scrollLine();
            }
        }
        
        // clears a line
        // resets x position
        // replaces prompt
        private clearLine(): void {
            // so - x is always 0, starting Y is the Y minus the font size so we are at the top of a letter
            // go to where the X currently is and font size (FWIW: +1 and +6 just sorta help it clear better :))
            _DrawingContext.clearRect(0, (this.currentYPosition - (this.currentFontSize + 1)), this.currentXPosition, this.currentFontSize + 6);
            this.currentXPosition = 0;
            _OsShell.putPrompt();
        }
        
        // recalls a command if provided with the proper
        // arguments - the only valid ones are "up" or "down"
        // returns a string of that command.
        private commandRecall(command): string{
            
            // string to return - cannot be slick because we need
            // to ensure the pointer stays at zero once at first element
            var returnString:string = "";
            
            // if the incoming command is up
            if(command === "up"){
                // if there already is something let us just clear it
                this.clearLine();
                // set our return string with something
                // TODO: how to handle no commands? 
                returnString = this.commandHistory[this.commandHistoryPointer--];
                //if we just returned the first element, stay there (how linux term works)
                if(this.commandHistoryPointer < 0){
                    this.commandHistoryPointer = 0;
                }
            // incoming command is down    
            }else if(command == "down"){
                // clear anything just in case
                this.clearLine();
                returnString = this.commandHistory[++this.commandHistoryPointer];
                // if we are at the last, return blank
                if(this.commandHistoryPointer > this.commandHistory.length){
                    this.commandHistoryPointer = this.commandHistory.length;
                    returnString = "";
                }
            }
            // finally return the string;    
            return returnString;
        }
        
        // looks up a command in the shells command list
        private commandLookup(wildcard): string[]{
            
            var returnString:string[] = [];
            var pointer:number = 0;
            
            // so not too many commands so just loop through looking
            // for the "wildcard" adding each to the return array
            for(var i:number = 0; i < _OsShell.commandList.length; i++){
                
                // this creates a substring from the length of the wildcard, this will allow
                // somone to search and length -- 1,2,3,4,5 does not matter
                // then we trim and match. NOTE: we only match left to right, nothing fancy.
                var tempString:string = _OsShell.commandList[i].command.substring(0, wildcard.length);
                    
                    // if we match, set the return string        
                    if(tempString === wildcard){
                        returnString[pointer++] = _OsShell.commandList[i].command;
                    }               
            }
            return returnString;
        }
        
        // This function will "scroll" one line at a time
        // not sure how it would react if a scroll was not needed
        // TODO: maybe make it so you can scroll multiple lines?
        private scrollLine(): void{
            // do not want Y to be larger than canvas height
            // 6 seems to be a "magic" number.
            this.currentYPosition = _Canvas.height - 6;
                
            // save the state of the console
            // getImageData(startX, startY, width, height) 
            // 0 - start at the top left corner
            // _DefaultFontSize _ FontHeightMargin - make up a default Y and we only want from line 2 on
            // width & height -- duh, we want the entire canvas (we do not need all but whatever now we can
            //                   resize without breaking scroll
            var save = _DrawingContext.getImageData(0, (_DefaultFontSize + _FontHeightMargin), _Canvas.width, _Canvas.height);
                
            // clear what is in the canvas
            this.clearScreen();
                
            // now starting at the top left corner (0,0) put the "clipped" saved stated from above back.
            _DrawingContext.putImageData(save, 0, 0); 
        }
    }
 }
