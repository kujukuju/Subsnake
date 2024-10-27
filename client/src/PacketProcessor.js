
class PacketProcessor {
    static SET_CLIENT = 0;
    static SET_POSITION_VELOCITY = 1;
    static REMOVE_ENTITY = 2;

    static packets = [];

    static addPacket(bytes) {
        this.packets.push(bytes);
    }

    static processPackets() {
        let index = 0;
        for (let i = 0; i < this.packets.length; i++) {
            while (index < this.packets[i].length) {
                index = this.process(this.packets[i], index);
                if (!Number.isInteger(index)) {
                    console.error('After processing a packet the index is invalid! ', index);
                    throw 'After processing a packet the index is invalid!';
                }
            }
        }

        this.packets.length = 0;
    }

    static process(bytes, index) {
        const type = BinaryHelper.readByte(bytes, index);
        index += 1;

        switch (type) {
            case PacketProcessor.SET_CLIENT: {
                const id = BinaryHelper.readUnsignedInt(bytes, index);
                index += 4;

                clientID = id;

            } break;

            case PacketProcessor.SET_POSITION_VELOCITY: {
                const id = BinaryHelper.readUnsignedInt(bytes, index);
                index += 4;
                const posX = BinaryHelper.readFloat(bytes, index);
                index += 4;
                const posY = BinaryHelper.readFloat(bytes, index);
                index += 4;
                const velX = BinaryHelper.readFloat(bytes, index);
                index += 4;
                const velY = BinaryHelper.readFloat(bytes, index);
                index += 4;

                if (!SnakeManager.snakes[id]) {
                    SnakeManager.addSnake(id);
                }

                const snake = SnakeManager.snakes[id];

                snake.position.x = posX;
                snake.position.y = posY;
                snake.velocity.x = velX;
                snake.velocity.y = velY;

                snake.interp.set(Date.now(), snake.position, snake.velocity);
                
            } break;

            case PacketProcessor.REMOVE_ENTITY: {
                const id = BinaryHelper.readUnsignedInt(bytes, index);
                index += 4;

                delete SnakeManager.snakes[id];
                
            } break;

            default:
                console.error('Found invalid packet type. ', type);
        }

        return index;
    }
}