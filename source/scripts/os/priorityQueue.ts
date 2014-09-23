//*  --------------------------------------------------------------
//   PriorityQueue.ts
//   
//   An interface that that is used to define the methods needed
//   for a priority queue. 
//
//   Author: Dan Blossom
//   -------------------------------------------------------------- */

module TSOS{

    interface PriorityQueue<T>{
        (arg: T): T;
        isEmpty(): boolean;
        insert(arg: T): boolean;
        dequeue(): T; 
    }

}