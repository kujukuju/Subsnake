
RoomPacketType :: enum u8 {
    SetClient;
    SetPositionVelocity;
    RemoveEntity;
    EatFood;
    RespawnFood;
    SetFood;
    EatBoost;
    RespawnBoost;
    SetBoost;
    SetRemainingBoost;
    SetScore;
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

EatFoodPacket :: struct {
    using #as packet: RoomPacket #align 1;
    packet.type = .EatFood;
    food_id: u32 #align 1;
} #no_padding

RespawnFoodPacket :: struct {
    using #as packet: RoomPacket #align 1;
    packet.type = .RespawnFood;
    food_id: u32 #align 1;
} #no_padding

SetFoodPacket :: struct {
    using #as packet: RoomPacket #align 1;
    packet.type = .SetFood;
    food_count: u32 #align 1;
    foods: [232] u8 #align 1;
} #no_padding

EatBoostPacket :: struct {
    using #as packet: RoomPacket #align 1;
    packet.type = .EatBoost;
    boost_id: u32 #align 1;
} #no_padding

RespawnBoostPacket :: struct {
    using #as packet: RoomPacket #align 1;
    packet.type = .RespawnBoost;
    boost_id: u32 #align 1;
} #no_padding

SetBoostPacket :: struct {
    using #as packet: RoomPacket #align 1;
    packet.type = .SetBoost;
    boost_count: u32 #align 1;
    boosts: [3] u8 #align 1;
} #no_padding

SetRemainingBoostPacket :: struct {
    using #as packet: RoomPacket #align 1;
    packet.type = .SetRemainingBoost;
    remaining_boost: float #align 1;
} #no_padding

SetScorePacket :: struct {
    using #as packet: RoomPacket #align 1;
    packet.type = .SetScore;
    id: u32 #align 1;
    score: u32 #align 1;
} #no_padding
