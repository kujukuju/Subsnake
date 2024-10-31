
let minimumLatency = Number.MAX_SAFE_INTEGER;

class PacketProcessor {
    static SET_CLIENT = 0;
    static SET_POSITION_VELOCITY = 1;
    static REMOVE_ENTITY = 2;
    static EAT_FOOD = 3;
    static RESPAWN_FOOD = 4;
    static SET_FOOD = 5;
    static EAT_BOOST = 6;
    static RESPAWN_BOOST = 7;
    static SET_BOOST = 8;
    static SET_REMAINING_BOOST = 9;
    static SET_SCORE = 10;
    static MESSAGE = 11;
    static CREATE_SNAKE = 12;

    static packets = [];

    static addPacket(bytes) {
        this.packets.push(bytes);
    }

    static processPackets() {
        for (let i = 0; i < this.packets.length; i++) {
            let index = 0;
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

                console.log('Setting client id to ' + id);

                clientID = id;
            } break;

            case PacketProcessor.SET_POSITION_VELOCITY: {
                const id = BinaryHelper.readUnsignedInt(bytes, index);
                index += 4;
                const time = BinaryHelper.readUnsignedInt(bytes, index);
                index += 4;
                const posX = BinaryHelper.readFloat(bytes, index);
                index += 4;
                const posY = BinaryHelper.readFloat(bytes, index);
                index += 4;
                const velX = BinaryHelper.readFloat(bytes, index);
                index += 4;
                const velY = BinaryHelper.readFloat(bytes, index);
                index += 4;

                if (SnakeManager.snakes[id]) {
                    const latency = Date.now() - time;
                    minimumLatency = Math.min(minimumLatency, latency);
                    const clientTime = time + minimumLatency;

                    const snake = SnakeManager.snakes[id];

                    snake.position.x = posX;
                    snake.position.y = posY;
                    snake.velocity.x = velX;
                    snake.velocity.y = velY;

                    const scale = snake.getScale();

                    snake.interp.set(clientTime, snake.position, snake.velocity);
                    snake.history.addHistory(snake.position, snake.velocity, Snake.TEXTURE.width * scale + Snake.INTERP_PADDING * scale);
                }
            } break;

            case PacketProcessor.REMOVE_ENTITY: {
                const id = BinaryHelper.readUnsignedInt(bytes, index);
                index += 4;
                const killerID = BinaryHelper.readUnsignedInt(bytes, index);
                index += 4;

                if (SnakeManager.snakes[id]) {
                    ExitAnimations.addSnakeExit(SnakeManager.snakes[id].sprite.position, SnakeManager.snakes[id].points, SnakeManager.snakes[id].sprite.scale);
                    AudioManager.playDeathNoise(SnakeManager.snakes[id].sprite.position.x, SnakeManager.snakes[id].sprite.position.y);

                    if (SnakeManager.snakes[killerID]) {
                        KillPoints.addKill(SnakeManager.snakes[id], SnakeManager.snakes[killerID]);
                    }

                    SnakeManager.snakes[id].destroy();
                    delete SnakeManager.snakes[id];
                }
            } break;

            case PacketProcessor.EAT_FOOD: {
                const foodID = BinaryHelper.readUnsignedInt(bytes, index);
                index += 4;

                FoodManager.removeFood(foodID);
            } break;

            case PacketProcessor.RESPAWN_FOOD: {
                const foodID = BinaryHelper.readUnsignedInt(bytes, index);
                index += 4;

                FoodManager.addFood(foodID);
            } break;
            
            case PacketProcessor.SET_FOOD: {
                const foodCount = BinaryHelper.readUnsignedInt(bytes, index);
                index += 4;

                const unpackedFood = [];
                unpack(unpackedFood, foodCount, bytes, index, 232);
                index += 232;

                for (let i = 0; i < unpackedFood.length; i++) {
                    if (unpackedFood[i]) {
                        FoodManager.addFood(i);
                    }
                }
            } break;

            case PacketProcessor.EAT_BOOST: {
                const boostID = BinaryHelper.readUnsignedInt(bytes, index);
                index += 4;

                FoodManager.removeBoost(boostID);
            } break;

            case PacketProcessor.RESPAWN_BOOST: {
                const boostID = BinaryHelper.readUnsignedInt(bytes, index);
                index += 4;

                FoodManager.addBoost(boostID);
            } break;

            case PacketProcessor.SET_BOOST: {
                const boostCount = BinaryHelper.readUnsignedInt(bytes, index);
                index += 4;

                const unpackedBoost = [];
                unpack(unpackedBoost, boostCount, bytes, index, 3);
                index += 3;

                for (let i = 0; i < unpackedBoost.length; i++) {
                    if (unpackedBoost[i]) {
                        FoodManager.addBoost(i);
                    }
                }
            } break;

            case PacketProcessor.SET_REMAINING_BOOST: {
                const remainingBoost = BinaryHelper.readFloat(bytes, index);
                index += 4;

                BoostManager.remainingBoost = remainingBoost;
            } break;

            case PacketProcessor.SET_SCORE: {
                const id = BinaryHelper.readUnsignedInt(bytes, index);
                index += 4;

                const score = BinaryHelper.readUnsignedInt(bytes, index);
                index += 4;

                if (SnakeManager.snakes[id]) {
                    SnakeManager.snakes[id].score = score;
                }
            } break;

            case PacketProcessor.MESSAGE: {
                const id = BinaryHelper.readUnsignedInt(bytes, index);
                index += 4;

                let message = '';
                for (let i = 0; i < 240; i++) {
                    const charCode = BinaryHelper.readUnsignedInt(bytes, index + i * 4);
                    if (charCode === 0) {
                        break;
                    }
                    
                    message += String.fromCharCode(charCode);
                }
                index += 240 * 4;

                const snakeName = id === 0 ? 'Server' : String(SnakeManager.snakes[id]?.name || '-');

                ChatManager.addLine(snakeName, message);
            } break;

            case PacketProcessor.CREATE_SNAKE: {
                const id = BinaryHelper.readUnsignedInt(bytes, index);
                index += 4;

                let name = '';
                for (let i = 0; i < 24; i++) {
                    const charCode = BinaryHelper.readUnsignedInt(bytes, index + i * 4);
                    if (charCode === 0) {
                        break;
                    }
                    
                    name += String.fromCharCode(charCode);
                }
                index += 24 * 4;

                if (!SnakeManager.snakes[id]) {
                    SnakeManager.addSnake(id, name);
                }
            } break;

            default:
                console.error('Found invalid packet type. ', type);
        }

        return index;
    }
}

function unpack(unpackedValues, unpackedCount, bytes, indexOffset, byteCount) {
    unpackedValues.length = unpackedCount;
    if (Math.floor(unpackedCount / 8) + 1 !== byteCount) {
        console.error('Got back invalid number of unpack values.', Math.floor(unpackedCount / 8), byteCount);
    }

    for (let i = 0; i < unpackedCount; i++) {
        const index = Math.floor(i / 8);
        const bitIndex = i % 8;

        unpackedValues[i] = !!(bytes[index + indexOffset] & (1 << bitIndex));
    }
}
