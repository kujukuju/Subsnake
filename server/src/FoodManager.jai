
FoodManager :: struct {
    food: [..] Resource;
    food_tree: BoundingTree2(*Resource);
    boost: [..] Resource;
    boost_tree: BoundingTree2(*Resource);
}

Resource :: struct {
    position: Vector2;
    eaten_ticks: int;
    index: int;
}

food_respawn_ticks :: TICKRATE * 30;
boost_respawn_ticks :: TICKRATE * 30;

food_manager_update :: () {
    for *food: context.food_manager.food {
        if food.eaten_ticks > 0 {
            food.eaten_ticks -= 1;

            if food.eaten_ticks == 0 {
                add_packet(context.room_id, RespawnFoodPacket.{
                    food_id = cast(u16) food.index,
                });
            }
        }
    }

    for *boost: context.food_manager.boost {
        if boost.eaten_ticks > 0 {
            boost.eaten_ticks -= 1;

            if boost.eaten_ticks == 0 {
                add_packet(context.room_id, RespawnBoostPacket.{
                    boost_id = cast(u16) boost.index,
                });
            }
        }
    }
}

send_initial_food_packets :: (connection: u32) {
    food_values := NewArray(context.food_manager.food.count, bool,, temp);
    for food: context.food_manager.food  food_values[it_index] = food.eaten_ticks == 0;
    packed_food := pack(food_values, 232);
    add_packet(context.room_id, connection, SetFoodPacket.{
        food_count = cast(u32) food_values.count,
        foods = packed_food,
    });
    assert(size_of(SetFoodPacket) == 237);

    boost_values := NewArray(context.food_manager.boost.count, bool,, temp);
    for boost: context.food_manager.boost  boost_values[it_index] = boost.eaten_ticks == 0;
    packed_boosts := pack(boost_values, 3);
    add_packet(context.room_id, connection, SetBoostPacket.{
        boost_count = cast(u32) boost_values.count,
        boosts = packed_boosts,
    });
    assert(size_of(SetBoostPacket) == 8);
}

maybe_eat_food :: (line: Line2, scale: float) -> int {
    eaten_food := 0;

    food_eat_radius := 14 * scale + 4;

    aabb: AABB2;
    aabb.lower = min(line.p1, line.p2) - food_eat_radius;
    aabb.upper = max(line.p1, line.p2) + food_eat_radius;

    for potential_food: query(*context.food_manager.food_tree, aabb) {
        if potential_food.eaten_ticks > 0 {
            continue;
        }

        food_distance := distance(line, potential_food.position);

        if food_distance <= food_eat_radius {
            potential_food.eaten_ticks = food_respawn_ticks;
            eaten_food += 1;

            add_packet(context.room_id, EatFoodPacket.{
                food_id = cast(u16) potential_food.index,
            });
        }
    }

    return eaten_food;
}

maybe_eat_boost :: (line: Line2, scale: float) -> bool {
    ate_boost := false;

    boost_eat_radius := 28 * scale + 4;

    aabb: AABB2;
    aabb.lower = min(line.p1, line.p2) - boost_eat_radius;
    aabb.upper = max(line.p1, line.p2) + boost_eat_radius;

    for potential_boost: query(*context.food_manager.boost_tree, aabb) {
        if potential_boost.eaten_ticks > 0 {
            continue;
        }

        boost_distance := distance(line, potential_boost.position);

        if boost_distance <= boost_eat_radius {
            potential_boost.eaten_ticks = boost_respawn_ticks;
            ate_boost = true;

            add_packet(context.room_id, EatBoostPacket.{
                boost_id = cast(u16) potential_boost.index,
            });
        }
    }

    return ate_boost;
}

load_food :: () {
    is_food :: (color: [4] u8) -> bool {
        return color[0] == 255 && color[1] == 0 && color[2] == 0 && color[3] == 255;
    }

    is_boost :: (color: [4] u8) -> bool {
        return color[0] == 0 && color[1] == 255 && color[2] == 0 && color[3] == 255;
    }

    for y: 0..food_image.height - 1 {
        for x: 0..food_image.width - 1 {
            pixel := get_pixel(food_image, x, y);

            if is_food(pixel) {
                array_add(*context.food_manager.food, Resource.{
                    .{cast(float) x, cast(float) y},
                    0,
                    context.food_manager.food.count,
                });
            } else if is_boost(pixel) {
                array_add(*context.food_manager.boost, Resource.{
                    .{cast(float) x, cast(float) y},
                    0,
                    context.food_manager.boost.count,
                });
            }
        }
    }

    food_count := context.food_manager.food.count;
    boost_count := context.food_manager.boost.count;

    print("There is % food.\n", food_count);
    print("There are % boosts.\n", boost_count);

    assert(food_count > 0, "No food found.\n");
    assert(boost_count > 0, "No boosts found.\n");

    context.food_manager.food_tree = create_bounding_tree2(*Resource);
    context.food_manager.boost_tree = create_bounding_tree2(*Resource);

    for *food: context.food_manager.food {
        create_proxy(*context.food_manager.food_tree, .{food.position, food.position}, food);
    }
    for *boost: context.food_manager.boost {
        create_proxy(*context.food_manager.boost_tree, .{boost.position, boost.position}, boost);
    }

    write_resource_file("../client/src/FoodPositions.js", "FOOD_POSITIONS", context.food_manager.food);
    write_resource_file("../client/src/BoostPositions.js", "BOOST_POSITIONS", context.food_manager.boost);
}

write_resource_file :: (file_name: string, variable_name: string, resources: [] Resource) {
    food_file_builder: String_Builder;
    
    append(*food_file_builder, tprint("const % = [", variable_name));
    for resource: resources {
        append(*food_file_builder, tprint("new Vec2(%, %)", resource.position.x, resource.position.y));

        if it_index < resources.count - 1 {
            append(*food_file_builder, ",");
        }
    }
    append(*food_file_builder, "];\n");

    food_file_string := builder_to_string(*food_file_builder);
    write_entire_file(file_name, food_file_string);
}
