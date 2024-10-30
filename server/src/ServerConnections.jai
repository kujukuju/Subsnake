


poll_connections :: (server: *mg_ws_server) {
    mg_ws_server_flush_and_poll(server);
    events := mg_ws_server_get_events(server);

    for event: events {
        if #complete event.type == {
            case .Connected;
                assert(!table_contains(*connection_rooms, event.id), "Received connected event for an already existing connection.\n");

                print("Received connection %.\n", event.id);

            case .Disconnected;
                connection_room, connection_found := table_find(*connection_rooms, event.id);
                if connection_found {
                    events := table_find_pointer(*room_events, connection_room);
                    assert(!!events, "Could not find room events!\n");
                    array_add(events, event);

                    table_remove(*connection_rooms, event.id);
                    room_connection_packets := table_find_pointer(*connection_send_packets, connection_room);
                    if room_connection_packets {
                        table_remove(room_connection_packets, event.id);
                    }
                } else {
                    print("Disconnected player without a room.\n");
                }

                print("Disconnected %.\n", event.id);

            case .Packet;
                connection_room, connection_found := table_find(*connection_rooms, event.id);
                if connection_found {
                    events := table_find_pointer(*room_events, connection_room);
                    assert(!!events, "Could not find room events!\n");

                    array_add(events, event);
                } else {
                    packet := cast(*ServerPacket) event.packet.data;
                    if #complete packet.type == {
                        case .JoinAny;
                            join_any_packet := cast(*ServerJoinAnyPacket) packet;
                            if size_of(ServerJoinAnyPacket) > event.packet.count {
                                continue;
                            }

                            best_room := get_best_room();
                            table_set(*connection_rooms, event.id, best_room);

                            print("Joined any % room %.\n", event.id, best_room);

                            connect_event: mg_ws_server_event;
                            connect_event.id = event.id;
                            connect_event.type = .Connected;

                            events := table_find_pointer(*room_events, best_room);
                            assert(!!events, "Could not find room events! %\n", best_room);

                            array_add(events, connect_event);

                            room_connection_packets := table_find_pointer(*connection_send_packets, best_room);
                            assert(!!room_connection_packets, "Could not find room connection packets!\n");

                            find_or_add(room_connection_packets, event.id);

                        case .JoinSpecific;
                            join_specific_packet := cast(*ServerJoinSpecificPacket) packet;
                            if size_of(ServerJoinSpecificPacket) > event.packet.count {
                                continue;
                            }

                            best_room: int;
                            if table_contains(*room_events, join_specific_packet.room) {
                                best_room = join_specific_packet.room;
                            } else {
                                best_room = get_best_room();
                            }
                            
                            table_set(*connection_rooms, event.id, best_room);

                            print("Joined specific % room %.\n", event.id, best_room);

                            connect_event: mg_ws_server_event;
                            connect_event.id = event.id;
                            connect_event.type = .Connected;

                            events := table_find_pointer(*room_events, best_room);
                            assert(!!events, "Could not find room events!\n");

                            array_add(events, connect_event);

                            room_connection_packets := table_find_pointer(*connection_send_packets, best_room);
                            assert(!!room_connection_packets, "Could not find room connection packets!\n");

                            find_or_add(room_connection_packets, event.id);

                        case;
                            print("Received invalid packet from a room-less person.\n");
                    }
                }
        }
    }
}

flush_connections :: (server: *mg_ws_server) {
    for room, connection: connection_rooms {
        room_connection_packets := table_find_pointer(*connection_send_packets, room);
        assert(!!room_connection_packets, "Could not find room connection packets!\n");

        connection_packets := table_find_pointer(room_connection_packets, connection);
        assert(!!connection_packets, "Could not find connection packets!\n");

        room_packets := table_find_pointer(*room_send_packets, room);
        assert(!!room_packets, "Could not find room packets! %\n", room);

        array_add(connection_packets, ..room_packets.*);

        mg_ws_server_send(server, connection, connection_packets.*);

        connection_packets.count = 0;
    }

    for *room_packets: room_send_packets {
        room_packets.count = 0;
    }

    mg_ws_server_flush_and_poll(server);
}

get_events :: (room: int) -> [] mg_ws_server_event {
    events := table_find_pointer(*room_events, room);
    if !events {
        return .[];
    }

    events_view := events.*;
    events.count = 0;

    return events_view;
}

add_packet :: (room: int, packet: $T) {
    // #assert is_pod(T, true) "Cannot send non pod packet type.\n";

    room_packets := table_find_pointer(*room_send_packets, room);
    assert(!!room_packets, "Could not find room packets!\n");

    bytes: [] u8;
    bytes.data = cast(*u8) *packet;
    bytes.count = size_of(T);

    array_add(room_packets, ..bytes);
}

add_packet :: (room: int, connection: u32, packet: $T) {
    // #assert is_pod(T, true) "Cannot send non pod packet type.\n";

    connection_room, connection_found := table_find(*connection_rooms, connection);
    assert(connection_found, "Could not find room for connection packet send.\n");
    assert(connection_room == room, "Trying to send a packet to a connection with a different room than expected.\n");
    if !connection_found || connection_room != room {
        return;
    }

    room_connection_packets := table_find_pointer(*connection_send_packets, room);
    assert(!!room_connection_packets, "Room connection packets doesn't exist!\n");

    connection_packets := table_find_pointer(room_connection_packets, connection);
    assert(!!connection_packets, "Connection packets not found!\n");

    bytes: [] u8;
    bytes.data = cast(*u8) *packet;
    bytes.count = size_of(T);

    array_add(connection_packets, ..bytes);
}

get_best_room :: () -> int {
    minimum_player_count := S64_MAX;
    minimum_player_room_index := 0;
    for room_index: 0..connection_send_packets.count - 1 {
        connection_table, room_valid := table_find(*connection_send_packets, room_index);
        if !room_valid {
            continue;
        }

        if connection_table.count < minimum_player_count {
            minimum_player_count = connection_table.count;
            minimum_player_room_index = room_index;
        }

        if connection_table.count < DESIRED_CONNECTIONS {
            return room_index;
        }
    }

    return minimum_player_room_index;
}

register_room :: (room: int) {
    find_or_add(*room_send_packets, room);
    find_or_add(*connection_send_packets, room);
    find_or_add(*room_events, room);
}

#scope_file

room_send_packets: Table(int, [..] u8);
connection_send_packets: Table(int, Table(u32, [..] u8));

room_events: Table(int, [..] mg_ws_server_event);

connection_rooms: Table(u32, int);
