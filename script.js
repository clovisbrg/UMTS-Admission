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


class Node {
    constructor(code) {
        this.code = code;
        this.rate = null;
        this.isAllocated = null;
        this.isAncestorsFree = new Boolean(true);
        this.treeLevel = null;
        this.left = null;
        this.right = null;
    }

    getBits() { // Convert the string "0101" into an array as [0, 1, 0, 1]
        bits = this.code.split("");
    }

    length() {
        return this.code.length;
    }

    dot(rhs) {
        // Does the scalar product "."
        if (this.length() !== rhs.length()) {
            throw new Error("Both codes doesn't have the same length.");
        }

        let sum = 0;
        for (let i = 0; i < this.length(); i++) {
            sum += this.getBits[i] * rhs.getBits[i];
        }
        return sum;
    }

    isOrthogonal(rhs) {
        if (this.length() !== rhs.length()) {
            throw new Error("Both codes doesn't have the same length.");
        }

        if (this.dot(rhs) !== 0) {
            return false;
        }

        return true;
    }
}

class BinaryTree {
    constructor() {
        this.root = null;
    }

    print(node = this.root, level = 0, prefix = '') {
        if (node !== null) {
            this.print(node.right, level + 1, 'R➜');
            console.log('level '+level+' : '+' '.repeat(level * 4) + prefix + node.code);
            this.print(node.left, level + 1, 'L⬅');
        }
    }

    insert(code) {
        // Create a node, assign his code, and insert this node as the root if there is not root, call the insertNode function otherwise
        const newNode = new Node(code);

        if (this.root === null) {
            this.root = newNode;
        } else {
            this.insertNode(this.root, newNode);
        }
    }

    insertNode(node, newNode) {
        if (newNode.code < node.code) {
            if (node.left === null) {
                node.left = newNode;
            } else {
                this.insertNode(node.left, newNode);
            }
        } else {
            if (node.right === null) {
                node.right = newNode;
            } else {
                this.insertNode(node.right, newNode);
            }
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

    findOSVFbycode(code) {
        if (node !== null) {
            if (node.code === code) {
                return node;
            } else {
                this.findFreeOVSF(node.left);
                this.findFreeOVSF(node.right);
            }
        }
    }

    findFreeOVSF(node) {
        if (node !== null) {
            if (node.isAllocated !== null) {
                return node;
            } else {
                this.findFreeOVSF(node.left);
                this.findFreeOVSF(node.right);
            }
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
    
    codeCount(node = this.root) {
        if (node === null) {
            return 0;
        }
        
        return 1 + this.codeCount(node.left) + this.codeCount(node.right);
    }
    
    calcShortestFreeCode(requestLen) {
        if (!isPowerOfTwo(requestLen)) {
            return 0;
        }
    
        const lastNode = tree.codeCount();
        const lastLevel = Math.log2(lastNode - 1);
        for (let lv = 2; lv <= lastLevel; lv++) {
            const codeLen = 1 << lv;
    
            if (codeLen < requestLen) {
                continue;
            }
    
            const beginNode = 1 << lv;
            const nodeCount = 1 << lv;
    
            for (let k = 0; k < nodeCount; k++) {
                if (tree.nodes[beginNode + k].isFreeCode()) {
                    return codeLen;
                }
            }
        }
        return 0;
    }
    
}

const binaryTree = new BinaryTree();
const osvfCode_tmp = ["0", "1", "00", "11", "01", "10"];
for (let i = 0; i < osvfCode_tmp.length; i++) {
    binaryTree.insert(osvfCode_tmp[i]);
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
