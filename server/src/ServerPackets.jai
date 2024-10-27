
ServerPacketType :: enum u8 {
    JoinAny;
    JoinSpecific;
}

ServerPacket :: struct {
    type: ServerPacketType #align 1;
} #no_padding

ServerJoinAnyPacket :: struct {
    using #as packet: ServerPacket #align 1;
    packet.type = .JoinAny;
} #no_padding

ServerJoinSpecificPacket :: struct {
    using #as packet: ServerPacket #align 1;
    packet.type = .JoinSpecific;
    room: int #align 1;
} #no_padding
