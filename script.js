const BITRATES_ALLOCATIONS = [2, 4, 8, 16, 32, 64, 128, 256];
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
    /** Description: This class represents a node in a binary tree
     * @param {string} code The code of the node
     * @param {number} rate The rate of the node
     * @param {number} treeLevel The level of the node in the tree
     * @param {Node} parent The parent of the node
     * @returns {Node} A node in a binary tree
     */
    constructor(code, rate, treeLevel, parent = null) {
        this.code = code;
        this.rate = rate;
        this.isAllocated = False;
        this.treeLevel = treeLevel;
        this.parent = parent;
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

    isAllDescendantsFree(node) {
        /** Description: This function checks if all the descendants of a node are free
         * @param {Node} node The node to check its descendants
         * @returns {boolean} True if all the descendants are free, False otherwise
         * */
        if (!node) return true;
        if (node.isAllocated) return false;
        return this.isAllDescendantsFree(node.left) && this.isAllDescendantsFree(node.right);
    }

    getPreemptiveNode(node) {
        // Description : Look for a node with only one child allocated
        if (!node) return true;
        if (node.isAllocated) return node;
        const leftResult = this.getPreemptiveNode(node.left);
        if (leftResult !== true) return leftResult;
        return this.getPreemptiveNode(node.right);
    }
 
    findNodeForPreemptiveMove(node, rate, id, is_ancestor_free = True) {
        /** Description : Get a node with a specific rate that have only ONE child allocated, 
         *               then allocate the code of the child to another node
         * @param {Node} node The node to start the search from
         * @param {number} rate The rate of the communication
         * @param {number} id The id of the communication
         * @param {boolean} is_ancestor_free The ancestor of the node is free
         * @returns {Node} The node with the specific rate
         * */
        if (node !== null) {
            console.log(node.treeLevel + " | id : " + id + " | Looking for a node with rate: " + rate + " || Current node : (" + node.rate + ") | code : " + node.code +
            " | ancestor_free : " + is_ancestor_free  + " | isAllocated : " + node.isAllocated);

            if (node.treeLevel > 1 && node.rate === rate && node.isAllocated === False && !(node.left.isAllocated && node.right.isAllocated)) {
                console.log("Trying with this node : " + node.code + " | left : " + node.left.isAllocated + " | right : " + node.right.isAllocated);
                
                let preemptiveNode = this.getPreemptiveNode(node);
                
                if (preemptiveNode !== true) {
                    if (preemptiveNode && preemptiveNode.isAllocated) {
                        console.log("preemptiveNode : " + preemptiveNode.code + " | isAllocated : " + preemptiveNode.isAllocated);
                        let newAllocationNode = this.findNode(this.root, preemptiveNode.rate, id, true);
                        if (newAllocationNode && newAllocationNode.code !== preemptiveNode.code) {
                            this.reallocate(preemptiveNode, newAllocationNode);
                        }
                    }
                }
                if (this.isAllDescendantsFree(node.left) || this.isAllDescendantsFree(node.right)) { // Now that the child is reallocated, we do a last verification
                    console.log("Node found for preemptive move");
                    return node;
                } else {
                    console.log("preemptive move FAILED...");
                }
            } else if (node.rate > rate) {
                return this.findNodeForPreemptiveMove(node.left, rate, id, (is_ancestor_free? is_ancestor_free : node.isAllocated)) || this.findNodeForPreemptiveMove(node.right, rate, id, (is_ancestor_free? is_ancestor_free : node.isAllocated));
            }
        } else {
            console.log("node not found in this branch for preemptive move");
            return null;
        }
    }

    findNode(node, rate, id, is_ancestor_free = True) {
        /** Description : Look for an AVAILABLE node with a specific rate    
         * @param {Node} node The node to start the search from
         * @param {number} rate The rate of the communication
         * @param {number} id The id of the communication
         * @param {boolean} is_ancestor_free The ancestor of the node is free
         * @returns {Node} The node with the specific rate
         * */    
        if (node !== null) {
            if (node.code != "0" && node.code != "00" && node.code != "01") {
                console.log(`${node.treeLevel} | id: ${id} | Looking for a node with rate: ${rate} || Current node: (${node.rate}) | code: ${node.code} | ancestor_free: ${is_ancestor_free} | isAllocated: ${node.isAllocated}`);
            }
            if (node.treeLevel > 1 && node.rate === rate && !node.isAllocated && is_ancestor_free === True) { 
                if (this.isAllDescendantsFree(node)) {
                    console.log("node found");
                    return node;
                } else {
                    console.log("A node was found but not all descendants are free, a preemptive move COULD BE needed...");
                    return False;
                }
            } else if (node.rate > rate) {
                return this.findNode(node.left, rate, id, is_ancestor_free && !node.isAllocated) || this.findNode(node.right, rate, id, is_ancestor_free && !node.isAllocated); // is_ancestor_free && !node.isAllocated === (is_ancestor_free? is_ancestor_free : node.isAllocated)
            }
        } else {
            console.log("node not found in this branch");
            return null;
        }
    }

    free(treeRoot, code) {
        /** Description : Look for the node with a specific code and set it as free
         * @param {Node} treeRoot The root of the tree
         * @param {string} code The code of the node to free
         * @returns {void}
         * */
        let targetNode = this.findNodeByCode(treeRoot, code);
        if (targetNode) {
            targetNode.isAllocated = false;
            console.log(`OVSF code ${targetNode.code} freed, isAllocated : ${targetNode.isAllocated}`);
        } else {
            console.log("No OVSF code found to be freed");
        }
    }

    findNodeByCode(node, code) {
        /** Description : Look for a node with a specific code
         * @param {Node} node The node to start the search from
         * @param {string} code The code of the node to find
         * @returns {Node} The node with the specific code
         **/
        if (!node) return null;
        if (node.code === code) return node;
        return this.findNodeByCode(node.left, code) || this.findNodeByCode(node.right, code);
    }

    reallocate(node, new_allocation_node) {
        /** Description : Reallocate a code to a new node
         * @param {Node} node The node to reallocate
         * @param {Node} new_allocation_node The new node to allocate the code to
         * @returns {string} The new code allocated
         **/
        console.log("REALLOCATION | Freeing this code " + node.code);
        this.free(this.root, node.code);
        new_allocation_node.isAllocated = True;
        getCommunicationByCode(node.code).ovsfCode = new_allocation_node.code;
        console.log("REALLOCATION | OVSF code " + new_allocation_node.code + " allocated : " + new_allocation_node.isAllocated);
        return new_allocation_node.code;
    }

    allocateOVSFCode(requestRate, id) {
        /** Description : Allocate an OVSF code
         * @param {number} requestRate The rate of the communication
         * @returns {string} The OVSF code allocated
         **/
        let node = this.findNode(this.root, requestRate, id);
        if (node) {
            console.log("Node found : " + node.code);
            node.isAllocated = true;
            return node.code;
        } else if (node === False) {
            console.log("Try a preemptive procedure");
            let newNode = this.findNodeForPreemptiveMove(this.root, requestRate, id);
            if (newNode) {
                console.log("New node found for the preemptive procedure: " + newNode);
                return newNode.code;
            } else {
                console.log("Preemptive procedure failed, the communication n " + id + " is dropped :(");
                return null;
            }
        } else {
            console.log("No OVSF code available, the communication n " + id + " is dropped :(");
            return null;
        }
    }
}

/*------------List of communications------------*/
let communications = [];

function getCommunicationByCode(code) {
    /** Description: This function returns a communication by its code
     * @param {string} code The code of the communication to find
     * @returns {Communication} The communication with the specific code
     * */
    return communications.find(comm => comm.ovsfCode === code);
}

/*------------Generation of communications------------*/
class CommunicationGenerator {
    /** Description: This class generates communications
     * @returns {CommunicationGenerator} A communication generator
     **/
    constructor() {
        // The worker to handle the communications
        this.worker = new Worker('communication.js');
        // Add an event listener to listen for messages from the worker
        // We attach the handleWorkerMessage function as a callback to the message event
        this.worker.addEventListener('message', this.handleWorkerMessage.bind(this));
        // bind(this) est utilisé pour s'assurer que le contexte (this) à l'intérieur 
        // de handleWorkerMessage fait référence à l'instance de CommunicationGenerator.
    }

    async generateCommunication(total_communication, PredefinedBitrate = null, PredefinedDuration = null) {
        /** Description: This function generates a communication at a random interval
         * @param {number} total_communication The number of communications to generate
         * **/
        let i=0;
        while (total_communication > 0) {
            total_communication--;
            await sleep(Math.floor(Math.random() * 4000) + 1000); // Random interval between 3 and 5 seconds
                let com = null;
                if (PredefinedBitrate !== null && PredefinedDuration !== null) {
                    com = new Communication(PredefinedBitrate[i], PredefinedDuration[i]); 
                } else {
                    com = new Communication(); 
                }
                com.ovsfCode = OVSFtree.allocateOVSFCode(com.allocated_bitrate, i); // Allocate an OVSF code to the communication
                //com.print();
                if (com.ovsfCode === null) {
                    console.log("Communication " + com.ovsfCode + " not allocated");
                    this.displayRejectedCommunication(com); // Display the rejected communication in the UI
                } else {
                    console.log("Communication " + com.ovsfCode + " allocated");
                    communications.push(com); // Add the communication to the list of communications
                    this.worker.postMessage(com); // Send a message to the worker to start the communication
                    this.displayCommunication(com); // Display the communication in the UI
                }
                i++;
                //updates the data for d3.js to display the tree
                d3Root = generateTreeData(OVSFtree.root);
                d3Root.children.forEach(collapse);
                update(d3Root);
                developTree(d3Root, 4);
        }
    }

    handleWorkerMessage(event) {
        /** Description: This function handles messages received from the worker
         * @param {Event} event The event received from the worker
         * **/
        console.log('Communication ' + event.data.ovsfCode + ' ended...');
        console.log(event.data);
        OVSFtree.free(OVSFtree.root, event.data.ovsfCode);

        // Remove the communication from the list of communications
        communications = communications.filter(comm => comm.ovsfCode !== event.data.ovsfCode);

        //updates the data for d3.js to display the tree
        d3Root = generateTreeData(OVSFtree.root);
        d3Root.children.forEach(collapse);
        update(d3Root);
        developTree(d3Root, 4);

        this.removeCommunication(event.data.ovsfCode);
    }

    displayCommunication(commData) {
        /** Description: This function displays a communication in the UI
         * @param {Communication} commData The communication to display
         * **/
        const container = document.getElementById('communications-grid-container');
        const commElement = document.createElement('div');
        commElement.id = `comm-${commData.ovsfCode}`;
        commElement.className = 'communication';
        commElement.innerHTML = `
            <h3>Communication Code:</h3>
            <p>${commData.ovsfCode}</p>
            <p>Duration: ${commData.duration.toFixed(1)}s</p>
            <p>Bitrate: ${commData.bitrate} kbps</p>
            <p>Size: ${commData.size} kb</p>
            <p>Time Left: <span id="timer-${commData.ovsfCode}">${commData.duration.toFixed(1)}</span>s</p>
        `;
        container.appendChild(commElement);
    
        // Update the timer over time
        const timerElement = document.getElementById(`timer-${commData.ovsfCode}`);
        let endTime = Date.now() + commData.duration * 1000;
    
        const interval = setInterval(() => {
            let timeLeft = endTime - Date.now();
            if (timeLeft > 0) {
                let seconds = (timeLeft / 1000).toFixed(1);
                timerElement.textContent = seconds;
            } else {
                clearInterval(interval);
                timerElement.textContent = '0.0';
            }
        }, 10);
    }

    removeCommunication(ovsfCode) {
        /** Description: This function removes a communication from the UI
         * @param {string} ovsfCode The code of the communication to remove
         * **/
        const commElement = document.getElementById(`comm-${ovsfCode}`);
        if (commElement) {
            commElement.remove();
        }
    }

    displayRejectedCommunication(commData) {
        /** Description: This function displays a rejected communication in the UI
         * @param {Communication} commData The communication to display
         * **/
        const container = document.getElementById('communications-grid-container');
        const commElement = document.createElement('div');
        commElement.className = 'rejected_communication';
        commElement.innerHTML = `
            <h3>Communication Code: REJECTED</h3>
            <p>Duration: ${commData.duration}s</p>
            <p>Bitrate: ${commData.bitrate} kbps</p>
            <p>Size: ${commData.size} kb</p>
        `;
        container.appendChild(commElement);
        setTimeout(() => {
            commElement.remove();
        }, 5000);
    }
}

class Communication {
    /** Description: This class represents an entering communication waiting to be assigned an ovsf code
     * @param {number} PredefinedBitrate The predefined bitrate of the communication
     * @param {number} PredefinedDuration The predefined duration of the communication
     * @returns {Communication} A communication
     * **/
    constructor(PredefinedBitrate = null, PredefinedDuration = null) {
        // Description: This constructor initializes the communication with random bitrate and size
        if (PredefinedBitrate !== null && PredefinedDuration !== null) {
            this.bitrate = PredefinedBitrate;
            this.size = Math.floor(Math.random() * 99) + 200;
            this.allocated_bitrate = this.allocate_bitrate(this.bitrate);
            this.duration = PredefinedDuration;
        } else {
            //this.bitrate = Math.floor(Math.random() * 255) + 2; // Random bitrate between 2 and 256 kbps
            this.bitrate = 256;
            this.size = Math.floor(Math.random() * 999) + 2000;
            this.allocated_bitrate = this.allocate_bitrate(this.bitrate);
            this.duration = this.size / this.bitrate;
        }
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

function OVSFTreeBuilder() {
    // Description : Build the OVSF tree and provoke collisions to test the preemptive procedure
    OVSFtree = new BinaryTree("0", 2048, 4);
    OVSFtree.isAllocated = true;
    OVSFtree.root.treeLevel = 0;
    tree = OVSFtree;
    tree.print();

    // Predefined bitrates and durations to provoke collisions and preemptive moves
    let PredefinedBitrate = [256, 256, 256, 256, 256, 256, 128, 128, 128, 256];
    let PredefinedDuration = [15, 15, 15, 15, 15, 15, 1, 10, 10, 5];

    // const generator = new CommunicationGenerator();
    generator.generateCommunication(10, PredefinedBitrate, PredefinedDuration);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/*------------Creation of the BinaryTree------------*/
var OVSFtree = new BinaryTree("0", 2048, 10);
var d3Root = generateTreeData(OVSFtree.root);
OVSFtree.isAllocated = true;
OVSFtree.root.treeLevel = 0;
generator = new CommunicationGenerator();
OVSFtree.print();

/*------------Graphical interface functions------------*/
document.getElementById('startButton').addEventListener('click', function() {
    const numCommunications = document.getElementById('numCommunications').value;
    const number = parseInt(numCommunications, 10);

    if (!isNaN(number) && number > 0) {
        generator.generateCommunication(number);
    } else {
        alert('Please enter a valid number of communications.');
    }
});

//DISPLAY THE TREE USING D3.js

function generateTreeData(node) {
    if (!node) {
      return null;
    }
  
    // Structure compatible avec D3.js
    const treeData = {
      name: node.rate.toString(),
      code: node.code.toString(),
      isAllocated: node.isAllocated,
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

const width = 960;
const height = 600;

var i = 0,
    duration = 150,
    rectW = 30,
    rectH = 15;

var tree = d3.layout.tree().nodeSize([30, 15]);
var diagonal = d3.svg.diagonal()
    .projection(function (d) {
    return [d.x + rectW / 2, d.y + rectH / 2];
});

var svg = d3.select("#body").append("svg").attr("width", 960).attr("height", 800)
    .call(zm = d3.behavior.zoom().scaleExtent([1,3]).on("zoom", redraw)).append("g")
    .attr("transform", "translate(" + 350 + "," + 20 + ")");

//necessary so that zoom knows where to zoom and unzoom from
zm.translate([350, 20]);

d3Root.x0 = 0;
d3Root.y0 = height / 2;

function collapse(d) {
    if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
    }
}

d3Root.children.forEach(collapse);
update(d3Root);
developTree(d3Root, 3);

function developTree(node, levelNeeded) {
    if (levelNeeded === 0) {
        return;
    }
    var currentNode = node;
    click(currentNode.children[0]);
    developTree(currentNode.children[0], levelNeeded-1);
    click(currentNode.children[1]);
    developTree(currentNode.children[1], levelNeeded-1);
}

d3.select("#body").style("height", "800px");

// Tooltip element
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip");

function update(source) {

    // Compute the new tree layout.
    var nodes = tree.nodes(d3Root).reverse(),
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
        .on("click", click)
        .on("mouseover", function(d) {
            tooltip.transition()
                .duration(0)
                .style("opacity", .9);
            tooltip.html("Code: " + d.code)
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(0)
                .style("opacity", 0);
        });

    nodeEnter.append("rect")
        .attr("width", rectW)
        .attr("height", rectH)
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .style("fill", function (d) {
        if (d.isAllocated) return "red";
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
        if (d.isAllocated) return "red";
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
