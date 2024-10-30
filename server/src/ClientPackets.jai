
ClientPacketType :: enum u8 {
    Inputs;
    Play;
    Message;
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

ClientPlayPacket :: struct {
    using #as packet: ClientPacket #align 1;
    packet.type = .Play;
    name: [24] s32 #align 1;
} #no_padding

ClientMessagePacket :: struct {
    using #as packet: ClientPacket #align 1;
    packet.type = .Message;
    message: [240] s32 #align 1;
} #no_padding
