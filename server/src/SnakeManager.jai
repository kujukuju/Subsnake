
max_boost_charge :: TICKRATE * 3;
boost_recharge :: TICKRATE / 2;

Snake :: struct {
    id: u32;
    position: Vector2;
    velocity: Vector2;
    direction: Vector2;
    valid_direction: Vector2;
    boost_requested: bool;
    points: [20] Vector2;
    point_count: int;
    history: History;
    continual_gravity_affect: float;
    available_boost_charge: float = max_boost_charge;
    boost_recharge_ticks: int;
    aabb: AABB2;
    score: int;
    dead: bool;
    killer_id: u32;
    spawn_protection_ticks: int = TICKRATE * 4;
    name: [24] s32;
}

free :: (snake: Snake) {
    free(snake.history);
}

update :: (snake: *Snake) {
    gravity :: 0.4;

    if length_squared(snake.direction) > 0.01 {
        snake.valid_direction = normalize(snake.direction);
    }

    if snake.spawn_protection_ticks > 0 {
        snake.spawn_protection_ticks -= 1;
    }

    old_available_boost_charge := snake.available_boost_charge;

    scale := get_scale(snake);

    points: [] Vector2;
    points.data = snake.points.data;
    points.count = snake.point_count;

    accel_vec := snake.direction;
    accel_length := length(accel_vec);
    accel_length = clamp(accel_length - 10, 0, 20);
    // force movement always
    accel_length = accel_length * (10.0 / 20.0) + 10.0;
    accel_vec = snake.valid_direction * accel_length * 0.02;

    accel_backwards_strength := max(-dot(normalize(accel_vec), normalize(snake.velocity)), 0);
    accel_ortho := Vector2.{-snake.velocity.y, snake.velocity.x};
    accel_ortho = project(accel_ortho, normalize(accel_vec));
    accel_vec = (normalize(accel_vec) * (1 - accel_backwards_strength) + normalize(accel_ortho) * accel_backwards_strength) * length(accel_vec);

    friction := 0.02;
    boosting := false;
    if snake.boost_requested && snake.available_boost_charge > 0 {
        boosting = true;
    }

    if boosting {
        snake.boost_recharge_ticks = boost_recharge;
        snake.available_boost_charge = max(snake.available_boost_charge - 1, 0);
        friction *= 0.1;
        accel_vec *= 2;
    }

    underground_strength := 0.0;
    for point: points {
        if is_ground(cast(int) point.x, cast(int) point.y) {
            underground_strength = 1.0 - cast(float) it_index / points.count;
            break;
        }
    }

    if underground_strength == 1 {
        snake.continual_gravity_affect = 0;
    } else {
        accel_vec *= underground_strength / 2.0 + 0.5;

        snake.continual_gravity_affect += 0.01 * (1.0 - underground_strength);
        snake.continual_gravity_affect -= snake.continual_gravity_affect * snake.continual_gravity_affect * 0.1;

        applied_gravity := snake.continual_gravity_affect;
        if boosting {
            applied_gravity = 0;
        }

        accel_vec.y += applied_gravity;
    }

    snake.boost_recharge_ticks = max(snake.boost_recharge_ticks - 1, 0);

    if !boosting && snake.boost_recharge_ticks == 0 {
        snake.available_boost_charge = min(snake.available_boost_charge + underground_strength * 0.5, max_boost_charge);
    }

    snake.velocity += accel_vec;

    underground_friction_strength := ifx boosting then 0.0 else underground_strength / 2.0;

    // allow faster movement in air but less control?
    friction *= underground_strength * 0.5 + 0.5;

    friction_force := snake.velocity * (underground_friction_strength + 0.5);
    magnitude_squared := length_squared(friction_force);
    friction_force = normalize(-friction_force) * max(magnitude_squared * friction, 0.1);

    snake.velocity += friction_force;
    
    snake.position += snake.velocity * (scale + 0.5);
    if snake.position.x < 0 {
        snake.position.x = 0;
        snake.velocity.x = max(snake.velocity.x, 0) - min(snake.velocity.x, 0) / 2;
    } else if snake.position.x >= cast(float) context.level.width {
        snake.position.x = context.level.width - 1.0;
        snake.velocity.x = min(snake.velocity.x, 0) - max(snake.velocity.x, 0) / 2;
    }
    if snake.position.y < 0 {
        snake.position.y = 0;
        snake.velocity.y = max(snake.velocity.y, 0) - min(snake.velocity.y, 0) / 2;
    } else if snake.position.y >= cast(float) context.level.height {
        snake.position.y = context.level.height - 1.0;
        snake.velocity.y = min(snake.velocity.y, 0) - max(snake.velocity.y, 0) / 2;
    }

    add_history(*snake.history, snake.position, cast(float) snake_image.width * scale);
    snake.points, snake.point_count = get_points(snake.history, 20, cast(float) snake_image.width * scale);

    snake.aabb = calculate_snake_aabb(snake);
    create_proxy(*context.snake_manager.snake_tree, snake.aabb, snake);

    add_packet(context.room_id, RoomSetPositionVelocityPacket.{
        id = snake.id,
        time = cast(u32) context.time,
        position = snake.position,
        velocity = snake.velocity,
    });

    if snake.available_boost_charge != 0 || old_available_boost_charge != 0 {
        add_packet(context.room_id, snake.id, SetRemainingBoostPacket.{
            remaining_boost = cast(float) snake.available_boost_charge / max_boost_charge,
        });
    }
}

get_body_radius :: (snake: *Snake) -> float {
    body_radius :: 8.0;
    scale := get_scale(snake);
    return body_radius * scale;
}

get_bite_radius :: (snake: *Snake) -> float {
    bite_radius :: 4.0;
    scale := get_scale(snake);
    return bite_radius * scale;
}

calculate_snake_aabb :: (snake: *Snake) -> AABB2 {
    padding := max(get_bite_radius(snake), get_body_radius(snake));

    points: [] Vector2;
    points.data = snake.points.data;
    points.count = snake.point_count;

    if points.count == 0 {
        aabb: AABB2;
        aabb.lower = snake.position - padding;
        aabb.upper = snake.position + padding;
        return aabb;
    }

    aabb: AABB2;
    aabb.lower = points[0] - padding;
    aabb.upper = points[0] + padding;
    for point: points {
        aabb.lower = min(aabb.lower, point - padding);
        aabb.upper = max(aabb.upper, point + padding);
    }

    return aabb;
}

check_damage :: (snake: *Snake) {
    if snake.dead || snake.spawn_protection_ticks > 0 {
        // you can't kill snakes that are already dead
        return;
    }

    points: [] Vector2;
    points.data = snake.points.data;
    points.count = snake.point_count;

    if points.count < 2 {
        return;
    }

    head_line := Line2.{points[0], points[1]};
    bite_radius := get_bite_radius(snake);

    for potential_snake: query(*context.snake_manager.snake_tree, snake.aabb) {
        if potential_snake == snake {
            continue;
        }

        if potential_snake.spawn_protection_ticks > 0 {
            continue;
        }

        enemy_points: [] Vector2;
        enemy_points.data = potential_snake.points.data;
        enemy_points.count = potential_snake.point_count;

        if enemy_points.count < 3 {
            continue;
        }

        body_radius := get_body_radius(snake);

        total_radius := bite_radius + body_radius;

        for i: 1..enemy_points.count - 2 {
            curr_point := enemy_points[i];
            next_point := enemy_points[i + 1];

            enemy_body_line := Line2.{curr_point, next_point};
            _, _, _, _, bite_distance_squared := nearest_point(head_line, enemy_body_line);
            if bite_distance_squared <= total_radius * total_radius {
                snake.dead = true;
                snake.killer_id = potential_snake.id;
                potential_snake.score += snake.score / 2;
            }
        }
    }
}

eat_food :: (snake: *Snake) {
    points: [] Vector2;
    points.data = snake.points.data;
    points.count = snake.point_count;

    if points.count < 3 {
        return;
    }

    head_line := Line2.{points[1], points[2]};

    eat_count := maybe_eat_food(head_line, get_scale(snake));
    snake.score += eat_count;
}

eat_boost :: (snake: *Snake) {
    points: [] Vector2;
    points.data = snake.points.data;
    points.count = snake.point_count;

    if points.count < 3 {
        return;
    }

    head_line := Line2.{points[1], points[2]};

    ate := maybe_eat_boost(head_line, get_scale(snake));
    if ate {
        snake.available_boost_charge = max_boost_charge;
    }
}

get_scale :: (snake: *Snake) -> float {
    // matches js
    scale := pow(snake.score / 10.0, 0.75);
    scale = scale / 2.0 + floor(scale / 2.0);
    scale /= 100.0;
    
    return (1.0 - exp(-scale * 2.0)) * 2.5 + 0.25;
}

SnakeManager :: struct {
    snakes: BlockAllocator(Snake);
    snake_lookup: Table(u32, *Snake);
    snake_tree: BoundingTree2(*Snake);
}

create_snake :: (id: u32, name: [24] s32) -> *Snake {
    snake := claim(*context.snake_manager.snakes);
    snake.id = id;
    snake.position = get_valid_spawn();
    radians := random_get_zero_to_one_open();
    snake.velocity.x = cos(radians) * 10;
    snake.velocity.y = sin(radians) * 10;
    snake.valid_direction = normalize(snake.velocity);
    snake.name = name;

    print("Creating snake % %.\n", id, snake);

    table_set(*context.snake_manager.snake_lookup, id, snake);

    add_packet(context.room_id, CreateSnakePacket.{
        id = id,
        name = name,
    });

    return snake;
}

remove_snake :: (id: u32, killer: u32) {
    snake, found := table_find(*context.snake_manager.snake_lookup, id);
    if !found {
        return;
    }

    release(*context.snake_manager.snakes, snake);
    table_remove(*context.snake_manager.snake_lookup, id);

    add_packet(context.room_id, RoomRemoveEntityPacket.{
        id = id,
        killer = killer,
    });
}

get_snake :: (id: u32) -> *Snake {
    snake, found := table_find(*context.snake_manager.snake_lookup, id);
    if !found {
        return null;
    }

    return snake;
}

send_initial_snake_packets :: (connection: u32) {
    for snake: context.snake_manager.snakes {
        add_packet(context.room_id, connection, CreateSnakePacket.{
            id = snake.id,
            name = snake.name,
        });
    }
}

snake_manager_update :: () {
    tree_reset(*context.snake_manager.snake_tree);

    for *snake: context.snake_manager.snakes {
        update(snake);
    }

    for *snake: context.snake_manager.snakes {
        check_damage(snake);
    }

    for *snake: context.snake_manager.snakes {
        eat_food(snake);
    }

    for *snake: context.snake_manager.snakes {
        eat_boost(snake);
    }

    for *snake: context.snake_manager.snakes {
        add_packet(context.room_id, SetScorePacket.{
            id = snake.id,
            score = cast(u32) snake.score,
        });
    }

    for *snake: context.snake_manager.snakes {
        if snake.dead {
            remove_snake(snake.id, snake.killer_id);
        }
    }
}
