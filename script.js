const BITRATES_ALLOCATIONS = [2, 4, 8, 16, 32, 64, 128, 256];

class Node {
    constructor(code) {
        this.code = code;
        this.isAllocated = null;
        this.isAncestorsFree = new Boolean(true);
        this.treeLevel = null;
        this.left = null;
        this.right = null;
    }

    length() {
        return this.code.length;
    }

    dot(rhs) {
        // Does the scalar product "."
        if (this.length() !== rhs.length()) {
            throw new Error("Les deux codes n'ont pas la même longueur.");
        }

        let sum = 0;
        for (let i = 0; i < this.length(); i++) {
            sum += this.bits[i] * rhs.bits[i];
        }
        return sum;
    }

    isOrthogonal(rhs) {
        if (this.length() !== rhs.length()) {
            throw new Error("Les deux codes n'ont pas la même longueur.");
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
        this.currentCommunication = null;
        this.osvfCode = null;
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
        this.size = Math.floor(Math.random() * 999) + 2;
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

const com1 = new Communication();
com1.print();