const BITRATES_ALLOCATIONS = [2, 4, 8, 16, 32, 64, 128, 256];

function opposite(num) {
    /** Description: This function returns the opposite of a binary number
     * @param {string} num The binary number to convert
     * @returns {string} The opposite of the binary number
     */
    let bits = num.split(""); // Convert the string "0101" into an array as [0, 1, 0, 1]
    let oppositeBits = [];
    for (let i = 0; i < bits.length; i++) {
        oppositeBits.push(1 - bits[i]);
    }
    return oppositeBits.join("");
}

class Node {
    /**
     * Description: This class represents a node in a binary tree
     * @param {string} code The code of the node
     * @param {number} rate The rate of the node
     * @param {number} treeLevel The level of the node in the tree
     * @returns {Node} A node in a binary tree
     */
    constructor(code, rate, treeLevel) {
        this.code = code;
        this.rate = rate;
        this.isAllocated = null;
        this.isAncestorsFree = new Boolean(true);
        this.treeLevel = treeLevel;
        this.left = null;
        this.right = null;
    }
}

class BinaryTree {
    /**
     * Description: This class represents a binary tree
     * @param {string} root The root of the tree
     * @param {number} rate The rate of the root
     * @param {number} levelNeeded The level of the tree
     * @returns {BinaryTree} A binary tree
     */
    constructor(root, rate, levelNeeded) {
        this.root = new Node(root, rate, 0);
        this.buildOVSFNode(this.root, 0, levelNeeded);
    }

    buildOVSFNode(node, currentLevel, levelNeeded) {
        /** Description: This function builds the OVSF codes in the tree
         * @param {Node} node The node to build the OVSF codes from
         * @param {number} currentLevel The current level of the tree
         * @param {number} levelNeeded The level to reach in the tree before stopping the building
         * @returns {void}
         * */
        if (currentLevel < levelNeeded) {
            node.left = new Node(node.code + node.code, node.rate, currentLevel + 1);
            node.right = new Node(node.code + opposite(node.code), node.rate, currentLevel + 1); 
            this.buildOVSFNode(node.left, currentLevel + 1, levelNeeded);
            this.buildOVSFNode(node.right, currentLevel + 1, levelNeeded);
        }
    }

    print(node = this.root, level = 0, prefix = '') {
        // Print the tree
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

    insertNode(node, newNode) { // ----- N'est pas utilisée
        /** Description : Insert a node in the tree
         * @param {Node} node The node to insert the new node in
         * @param {Node} newNode The new node to insert in the tree
         * @returns {void}
         */
        if (node.left === null) { // If the left child of the current node is empty
            node.left = newNode;
        }
        else if (node.right === null) {
            node.right = newNode;
        } else {
            this.insertNode(node.right, newNode);
        }
    }

    findNode(node, rate) {
        // Description : Look for a node with a specific rate
        if (node == null || node.isAllocated) {
            return null;
        } else if (node.code == rate) {
            return node;
        } else {
            return this.findNode(node.left, rate) || this.findNode(node.right, rate);
        }
    }

    findFreeOVSF(node) {
        // Description : Look for a free OVSF code
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
        // Description : Look for the node with a specific code and set it as free
        let node = this.findNodeByCode(this.root, code);
        if (node) {
            node.isAllocated = false;
        }
    }

    findNodeByCode(node, code) {
        // Description : Look for a node with a specific code
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

function OVSFTreeBuilder() {
    tree = new BinaryTree("0", 2048, 3);
    tree.root.treeLevel = 0;
    tree.print();
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
        this.bitrate = Math.floor(Math.random() * 255) + 2; // Random bitrate between 2 and 256 kbps
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