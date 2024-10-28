
ClientPacketType :: enum u8 {
    Inputs;
}

ClientPacket :: struct {
    type: ClientPacketType #align 1;
} #no_padding

ClientInputsPacket :: struct {
    using #as packet: ClientPacket #align 1;
    packet.type = .Inputs;
    direction: Vector2 #align 1;
    boost: u8 #align 1;
} #no_padding
