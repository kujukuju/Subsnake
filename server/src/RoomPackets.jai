
RoomPacketType :: enum u8 {
    SetClient;
    SetPositionVelocity;
    RemoveEntity;
}

RoomPacket :: struct {
    type: RoomPacketType #align 1;
} #no_padding

RoomSetClientPacket :: struct {
    using #as packet: RoomPacket #align 1;
    packet.type = .SetClient;
    id: u32 #align 1;
} #no_padding

RoomSetPositionVelocityPacket :: struct {
    using #as packet: RoomPacket #align 1;
    packet.type = .SetPositionVelocity;
    id: u32 #align 1;
    time: u32 #align 1;
    position: Vector2 #align 1;
    velocity: Vector2 #align 1;
} #no_padding

RoomRemoveEntityPacket :: struct {
    using #as packet: RoomPacket #align 1;
    packet.type = .RemoveEntity;
    id: u32 #align 1;
} #no_padding
