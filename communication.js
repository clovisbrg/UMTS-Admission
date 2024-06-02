// worker.js

// Function to be executed by the worker
// function workerFunction(com_data) {
//     console.log(com_data);
//     // Perform some tasks here
//     //let data = new Data('Communication ended.', com_data.communication);
//     // data.type = 'Communication ended.';
//    // data.communication = com_data;
    
//     // sleep for code seconds
//     setTimeout(function() {
//         //Code to execute after the timeout
//         console.log('End of communication (' + data.duration + ' seconds)');
//         self.postMessage(com); // Send a message to the main thread
//     }, data.duration * 1000);
// }

// Add an event listener to listen for messages from the main thread
self.addEventListener('message', function(event) {
    
    // Call the worker function when a message is received
    console.log("--- Commmunication to start : " + event.data);
    // if (typeof(event.data) !== 'string') {

    setTimeout(function() {
        //Code to execute after the timeout
        console.log('--- End of communication (code : '+event.data.ovsfCode+' duration : '+event.data.duration + ' seconds)');
        self.postMessage(event.data); // Send a message to the main thread
    }, event.data.duration * 1000);

    //workerFunction(event.data);

    
});