// worker.js
self.addEventListener('message', function(event) {
    /** Description : Add an event listener to listen for messages from the main thread
     * @param {MessageEvent} event : The message received from the main thread
     * */
    
    // Call the worker function when a message is received
    console.log("--- Commmunication to start : " + event.data);

    setTimeout(function() {
        // Code to execute after the timeout
        console.log('--- End of communication (code : ' + event.data.ovsfCode 
            + ' duration : ' + event.data.duration + ' seconds)');
        self.postMessage(event.data); // Send a message to the main thread
        
    }, event.data.duration * 1000);
});