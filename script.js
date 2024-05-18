const BITRATES_ALLOCATIONS = [128,256];//[2, 4, 8, 16, 32, 64, 128, 256];
const True = Boolean(true);
const False = Boolean(false);

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
        this.isAllocated = False;
        this.isAncestorsFree = True;
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
            node.left = new Node(node.code + node.code, node.rate/2, currentLevel + 1);
            node.right = new Node(node.code + opposite(node.code), node.rate/2, currentLevel + 1); 
            this.buildOVSFNode(node.left, currentLevel + 1, levelNeeded);
            this.buildOVSFNode(node.right, currentLevel + 1, levelNeeded);
        }
    }

    print(node = this.root, level = 0, prefix = '') {
        // Print the tree
        if (node !== null) {
            this.print(node.right, level + 1, 'R➜');
            console.log('level '+level+' : '+' '.repeat(level * 4) + prefix + node.code + ' | rate : ' + node.rate + ' | isAllocated : ' + node.isAllocated);
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
        // Description : Look for an AVAILABLE node with a specific rate
        if (node !== null) {
            if (node.rate === rate && node.isAllocated === False) {
                console.log("node found");
                return node;
            } else { //TODO : check the level of each node found and take the lower one
                return this.findNode(node.left, rate) || this.findNode(node.right, rate);
            }
        } else {
            //console.log("node not found in this branch");
            return null;
        }
    }

    free(root, code) {
        // Description : Look for the node with a specific code and set it as free
        let node = this.findNodeByCode(root, code);

        if (node) {
            console.log("OVSF code " + node.code + " freed");
            node.isAllocated = false;
        }else{
            console.log("No OVSF code found to be freed")
        }
    }

    findNodeByCode(node, code) {
        /** Description : Look for a node with a specific code
         * @param {Node} node The node to start the search from
         * @param {string} code The code of the node to find
         * @returns {Node} The node with the specific code
         **/
        if (node == null) {
            return null;
        } else if (node.code == code) {
            return node;
        } else {
            return this.findNodeByCode(node.left, code) || this.findNodeByCode(node.right, code);
        }
    }

    allocateOVSFCode(requestRate) {
        /** Description : Allocate an OVSF code
         * @param {number} requestRate The rate of the communication
         * @returns {string} The OVSF code allocated
         **/
        let node = this.findNode(this.root, requestRate);
        if (node) {
            node.isAllocated = true;
            console.log("OVSF code " + node.code + " allocated");
            return node.code;
        } else {
            console.log("No OVSF code available");
            return null;
        }
    }
}

function OVSFTreeBuilder() {
    tree = new BinaryTree("0", 2048, 4);
    tree.isAllocated = true;
    tree.root.treeLevel = 0;
    tree.print();

    const generator = new CommunicationGenerator(tree);
    generator.generateCommunication(6);
}

class CommunicationGenerator {
    /** Description: This class generates communications
     * @param {BinaryTree} tree The tree to allocate the OVSF codes
     * @returns {CommunicationGenerator} A communication generator
     **/
    constructor(tree) {
        /** Description: This constructor initializes the communication generator
         * communications : The list of communications
         * worker : The worker to handle the communications
         **/
        this.tree = tree;
        this.communications = [];
        this.worker = new Worker('communication.js');
        // Add an event listener to listen for messages from the worker
        // We attach the handleWorkerMessage function as a callback to the message event
        this.worker.addEventListener('message', this.handleWorkerMessage.bind(this));
        // bind(this) est utilisé pour s'assurer que le contexte (this) à l'intérieur 
        // de handleWorkerMessage fait référence à l'instance de CommunicationGenerator.
    }

    generateCommunication(total_communication) {
        /** Description: This function generates a communication at a random interval
         * @param {number} total_communication The number of communications to generate
         * **/
        while (total_communication > 0) {
            total_communication--;
            setTimeout(() => { // We wait for a random interval before generating the communication
                let com = new Communication(); // Create a new communication
                com.ovsfCode = this.tree.allocateOVSFCode(com.allocated_bitrate); // Allocate an OVSF code to the communication
                com.print();
                if (com.ovsfCode === null) {
                    console.log("Communication " + com.ovsfCode + " not allocated");
                } else {
                    console.log("Communication " + com.ovsfCode + " allocated");
                    this.communications.push(com); // Add the communication to the list of communications
                    this.worker.postMessage(com); // Send a message to the worker to start the communication
                }
            },Math.floor(Math.random() * 6000) + 3000); // Random interval between 3 and 5 seconds
        }
    }

    handleWorkerMessage(event) {
        /** Description: This function handles messages received from the worker
         * @param {Event} event The event received from the worker
         **/
        console.log('Communication ' + event.data.ovsfCode + ' ended...');
        tree.free(tree.root, event.data.ovsfCode);
    }
}

class Device {
    // Description: This class represents a device in the network
    constructor(name){
        this.name = name;
        this.currentCommunication = null;
        this.ovsfCode = null;
    }
    print(){
        // Description: This function prints the device's attributes
        console.log(this.name + " " + this.ovsfCode);
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
        this.ovsfCode = null;
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
        console.log("OVSF Code: " + this.ovsfCode);
    }
}

function generateHTML(node, level) {
    if (!node) return "";
  
    const left = generateHTML(node.left, level + 1);
    const right = generateHTML(node.right, level + 1);
  
    return `
        <li>
            <div class="node">
                <!--div class="code">${node.code}</div!-->
                <div class="rate">${node.rate}</div>
                <!--div class="isAllocated">${node.isAllocated}</div!-->
            </div>
            <ul>
                ${left}
                ${right}
            </ul>
        </li>

    `;
  }

    // const tree = new BinaryTree("0", 2048, 10);
    // tree.isAllocated = true;
    // tree.root.treeLevel = 0;
    // tree.print();
    // const html = generateHTML(tree.root, 0);
    // const container = document.getElementById("tree");
    // container.innerHTML = html;

//USING D3.js

function generateTreeData(node) {
    if (!node) {
      return null;
    }
  
    // Structure compatible avec D3.js
    const treeData = {
      name: node.rate.toString(),
      children: []
    };
  
    // Ajouter les enfants gauche et droit récursivement
    if (node.left) {
      treeData.children.push(generateTreeData(node.left));
    }
    if (node.right) {
      treeData.children.push(generateTreeData(node.right));
    }
  
    // Si le nœud n'a pas de children, supprimer la propriété children
    if (treeData.children.length === 0) {
      delete treeData.children;
    }
  
    return treeData;
  }

const OVSFtree = new BinaryTree("0", 2048, 10);
root = generateTreeData(OVSFtree.root);
console.log(root);

const width = 960;
const height = 600;

var i = 0,
    duration = 150,
    rectW = 60,
    rectH = 30;

var tree = d3.layout.tree().nodeSize([70, 40]);
var diagonal = d3.svg.diagonal()
    .projection(function (d) {
    return [d.x + rectW / 2, d.y + rectH / 2];
});

var svg = d3.select("#body").append("svg").attr("width", 1000).attr("height", 1000)
    .call(zm = d3.behavior.zoom().scaleExtent([1,3]).on("zoom", redraw)).append("g")
    .attr("transform", "translate(" + 350 + "," + 20 + ")");

//necessary so that zoom knows where to zoom and unzoom from
zm.translate([350, 20]);

root.x0 = 0;
root.y0 = height / 2;

function collapse(d) {
    if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
    }
}

root.children.forEach(collapse);
update(root);

d3.select("#body").style("height", "800px");

function update(source) {

    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function (d) {
        d.y = d.depth * 100;
    });

    // Update the nodes…
    var node = svg.selectAll("g.node")
        .data(nodes, function (d) {
        return d.id || (d.id = ++i);
    });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
        return "translate(" + source.x0 + "," + source.y0 + ")";
    })
        .on("click", click);

    nodeEnter.append("rect")
        .attr("width", rectW)
        .attr("height", rectH)
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .style("fill", function (d) {
        return d._children ? "lightsteelblue" : "#fff";
    });

    nodeEnter.append("text")
        .attr("x", rectW / 2)
        .attr("y", rectH / 2)
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(function (d) {
        return d.name;
    });

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
    });

    nodeUpdate.select("rect")
        .attr("width", rectW)
        .attr("height", rectH)
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .style("fill", function (d) {
        return d._children ? "lightsteelblue" : "#fff";
    });

    nodeUpdate.select("text")
        .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function (d) {
        return "translate(" + source.x + "," + source.y + ")";
    })
        .remove();

    nodeExit.select("rect")
        .attr("width", rectW)
        .attr("height", rectH)
    //.attr("width", bbox.getBBox().width)""
    //.attr("height", bbox.getBBox().height)
    .attr("stroke", "black")
        .attr("stroke-width", 1);

    nodeExit.select("text");

    // Update the links…
    var link = svg.selectAll("path.link")
        .data(links, function (d) {
        return d.target.id;
    });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("x", rectW / 2)
        .attr("y", rectH / 2)
        .attr("d", function (d) {
        var o = {
            x: source.x0,
            y: source.y0
        };
        return diagonal({
            source: o,
            target: o
        });
    });

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function (d) {
        var o = {
            x: source.x,
            y: source.y
        };
        return diagonal({
            source: o,
            target: o
        });
    })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}

// Toggle children on click.
function click(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }
    update(d);
}

//Redraw for zoom
function redraw() {
  //console.log("here", d3.event.translate, d3.event.scale);
  svg.attr("transform",
      "translate(" + d3.event.translate + ")"
      + " scale(" + d3.event.scale + ")");
}
