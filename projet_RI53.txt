Pseudo-code : 

Définir OVSF_Tree comme un arbre binaire
Définir Communications comme une liste vide

Fonction Arrivée_Communication():
    taille = Générer aléatoirement la taille de la communication
    débit = Générer aléatoirement le débit requis
    Ajouter une nouvelle communication à Communications avec taille et débit

Fonction Allocation_Ressources():
    Pour chaque communication dans Communications:
        Si un code OVSF est disponible avec le débit correspondant:
            Allouer le code OVSF à la communication
            Calculer la durée de la communication en fonction de la taille et du débit alloué
        Sinon:
            Rejeter la communication
            Optionnellement, mettre en œuvre une procédure de réessai

Fonction Changement_OVSF():
    Pour chaque communication dans Communications:
        Si un code OVSF supérieur est disponible:
            Libérer le code OVSF actuellement alloué à la communication
            Allouer le nouveau code OVSF à la communication

Tant que le simulateur est en cours d'exécution:
    Arrivée_Communication()
    Allocation_Ressources()
    Changement_OVSF()



Code en js :


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

class Communication {
    constructor(size, rate) {
        this.size = size;
        this.rate = rate;
        this.duration = size / rate;
        this.code = null;
    }
}

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

let communications = [];
let ovsf = new OVSF();
let rejectedCommunications = [];

function arrivalOfCommunication() {
    let size = Math.random(); // Générer aléatoirement la taille de la communication
    let rate = Math.random(); // Générer aléatoirement le débit requis
    communications.push(new Communication(size, rate));
}

function resourceAllocation() {
    for (let i = 0; i < communications.length; i++) {
        let communication = communications[i];
        let code = ovsf.allocate(communication.rate);
        if (code) {
            // Calculer la durée de la communication en fonction de la taille et du débit alloué
            communication.duration = communication.size / communication.rate;
            communication.code = code;
        } else {
            // Rejeter la communication
            rejectedCommunications.push(communication);
            communications.splice(i, 1);
            i--;
        }
    }
}

function retryRejectedCommunications() {
    for (let i = 0; i < rejectedCommunications.length; i++) {
        let communication = rejectedCommunications[i];
        let code = ovsf.allocate(communication.rate);
        if (code) {
            // Calculer la durée de la communication en fonction de la taille et du débit alloué
            communication.duration = communication.size / communication.rate;
            communication.code = code;
            communications.push(communication);
            rejectedCommunications.splice(i, 1);
            i--;
        }
    }
}

while (true) { // Tant que le simulateur est en cours d'exécution
    arrivalOfCommunication();
    resourceAllocation();
    retryRejectedCommunications();
}
