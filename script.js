const BITRATES_ALLOCATIONS = [2, 4, 8, 16, 32, 64, 128, 256];
const DIC_BITRATES_TO_OVSF = {
    2: {ovsfLength: 512}, 
    4: {ovsfLength: 256}, 
    8: {ovsfLength: 128}, 
    16: {ovsfLength: 64}, 
    32: {ovsfLength: 32}, 
    64: {ovsfLength: 16}, 
    128: {ovsfLength: 8}, 
    256: {ovsfLength: 4}
}


class Device {
    // Description: This class represents a device in the network
    constructor(name){
        this.name = name;
        this.pendingCommunication = null;
        this.currentCommunication = null;
        this.osvfCode = null;
    }

    createCommunication(){
        // Description: This function creates a new communication
        this.pendingCommunication = new Communication();
    }

    askForOsvfCode(){
        // Description: This function asks the network for an ovsf code
        // need the netwrok clas first :(
            // this.osvfCode = network.getOsvfCode();
    }



    print(){
        // Description: This function prints the device's attributes
        console.log(this.name + " " + this.osvfCode);
    }
}

class Communication {
    // Description: This class represents an entering communication waiting to be assigned an ovsf code
    constructor() {
        // Description: This constructor initializes the communication with random bitrate and size
        this.bitrate = Math.floor(Math.random() * 255) + 2;
        this.size = Math.floor(Math.random() * 9999) + 2;
        this.allocated_bitrate = this.allocate_bitrate(this.bitrate);
        this.duration = this.size / this.allocated_bitrate;
    }

    allocate_bitrate(length) {
        // Description: This function allocates the most optimal bitrate to the communication
        for (let auth_bitrate of BITRATES_ALLOCATIONS) {
            if (length > auth_bitrate) {
                continue;
            } else {
                return auth_bitrate;
            }
        }
    }
    print() {
        // Description: This function prints the communication's attributes
        console.log("Bitrate: " + this.bitrate + " kbps");
        console.log("Size: " + this.size + " kb");
        console.log("Allocated Bitrate: " + this.allocated_bitrate + " kbps");
        console.log("Duration: " + this.duration + " s");
    }
}

class Network {
    // Description: This class represents the network
    constructor(){
        this.devices = [];
    }

    addDevice(device){
        // Description: This function adds a device to the network
        this.devices.push(device);
    }

    getOsvfCode(bitrate){
        // Description: This function returns an ovsf code
        // need to implement
        if (osvfCode)
            return osvfCode;
        else
            return null;
    }
}

class Node {
    constructor(code) {
        this.code = code;
        this.left = null;
        this.right = null;
        this.isAllocated = false;
    }
}

class BinaryTree {
    constructor() {
        this.root = new Node(1);
    }

    buildTree(){
        
    }

    allocate(rate) {
        // Parcourir l'arbre pour trouver un noeud non alloué avec le taux correspondant
        let node = this.findNode(this.root, rate);
        if (node) {
            node.isAllocated = true;
            return node.code;
        } else {
            return null;
        }
    }

    findNode(node, rate) {
        if (node == null || node.isAllocated) {
            return null;
        } else if (node.code == rate) {
            return node;
        } else {
            return this.findNode(node.left, rate) || this.findNode(node.right, rate);
        }
    }

    free(code) {
        // Parcourir l'arbre pour trouver le noeud avec le code correspondant
        let node = this.findNodeByCode(this.root, code);
        if (node) {
            node.isAllocated = false;
        }
    }

    findNodeByCode(node, code) {
        if (node == null) {
            return null;
        } else if (node.code == code) {
            return node;
        } else {
            return this.findNodeByCode(node.left, code) || this.findNodeByCode(node.right, code);
        }
    }
}

// class Communication {
//     constructor(size, rate) {
//         this.size = size;
//         this.rate = rate;
//         this.duration = size / rate;
//         this.code = null;
//     }
// }

class OVSF {
    constructor() {
        this.tree = new BinaryTree();
    }

    allocate(rate) {
        return this.tree.allocate(rate);
    }

    free(code) {
        this.tree.free(code);
    }
}

let com1= new Communication()
console.log(com1.print())
