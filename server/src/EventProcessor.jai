
process_events :: (events: [] mg_ws_server_event) {
    for event: events {
        if #complete event.type == {
            case .Connected;
                process_connected(event.id);

            case .Disconnected;
                process_disconnected(event.id);

            case .Packet;
                bytes: [] u8;
                bytes.data = event.packet.data;
                bytes.count = event.packet.count;

                while bytes.count > 0 {
                    packet := cast(*ClientPacket) bytes.data;

                    #insert #run () -> string {
                        client_packet_type_info := type_info(ClientPacketType);
                        builder: String_Builder;
                        append(*builder, "if #complete packet.type == {\n");
                        for name: client_packet_type_info.names {
                            append(*builder, "case .");
                            append(*builder, name);
                            append(*builder, ";\n");

                            append(*builder, "if bytes.count < size_of(Client");
                            append(*builder, name);
                            append(*builder, "Packet) {\n");
                            append(*builder, "continue event;\n");
                            append(*builder, "}\n");

                            append(*builder, "process(event.id, cast(*Client");
                            append(*builder, name);
                            append(*builder, "Packet) packet);\n");

                            append(*builder, "bytes.data += size_of(Client");
                            append(*builder, name);
                            append(*builder, "Packet);\n");
                            append(*builder, "bytes.count -= size_of(Client");
                            append(*builder, name);
                            append(*builder, "Packet);\n");
                        }
                        append(*builder, "}\n");
                        return builder_to_string(*builder);
                    }();
                }
        }
    }
}

process_connected :: (connection: u32) {
    create_snake(connection);

    add_packet(context.room_id, connection, RoomSetClientPacket.{
        id = connection,
    });
}

process_disconnected :: (connection: u32) {
    remove_snake(connection);

    add_packet(context.room_id, connection, RoomRemoveEntityPacket.{
        id = connection,
    });
}

process :: (connection: u32, packet: *ClientInputsPacket) {
    snake := get_snake(connection);
    if snake {
        snake.direction = packet.direction;
    }
}
