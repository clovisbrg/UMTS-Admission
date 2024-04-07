const BITRATES_ALLOCATIONS = [2, 4, 8, 16, 32, 64, 128, 256];

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