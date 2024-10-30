
class Connection {
    static websocket;

    static connect() {
        this.websocket = new WebSocket("wss://server.subsnake.xyz:7626");
        this.websocket.binaryType = 'arraybuffer';

        this.websocket.addEventListener('close', event => {
            console.log('Websocket closed. ', event);
            this.closed();
        });

        this.websocket.addEventListener('error', event => {
            console.log('Websocket error. ', event);
            this.closed();
        });

        this.websocket.addEventListener('message', event => {
            this.message(event);
        });

        this.websocket.addEventListener('open', event => {
            this.opened();
        });
    }

    static closed() {
        console.log('Actually closed!');
    }
    
    static message(event) {
        const bytes = new Uint8Array(event.data);

        PacketProcessor.addPacket(bytes);
    }

    static opened() {
        console.log('Actually opened!');

        // request room
        this.send([0]);
    }

    static send(bytes) {
        if (!this.websocket || this.websocket.readyState !== 1) {
            return;
        }

        this.websocket.send(new Uint8Array(bytes));
    }
}
