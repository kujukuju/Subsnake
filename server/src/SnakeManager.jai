
max_dash_charge :: 300.0;

Snake :: struct {
    id: u32;
    position: Vector2;
    velocity: Vector2;
    direction: Vector2;
    boost_requested: bool;
    points: [20] Vector2;
    point_count: int;
    history: History;
    continual_gravity_affect: float;
    available_dash_charge: float = max_dash_charge;
}

free :: (snake: Snake) {
    free(snake.history);
}

update :: (snake: *Snake) {
    gravity :: 0.4;
    speed :: 4.0;

    points: [] Vector2;
    points.data = snake.points.data;
    points.count = snake.point_count;

    accel_vec := snake.direction;
    accel_length := length(accel_vec);
    accel_length = clamp(accel_length - 10, 0, 20);
    accel_vec = normalize(accel_vec) * accel_length * 0.01;

    friction := 0.02;
    dashing := false;
    if snake.boost_requested && snake.available_dash_charge > 0 {
        snake.available_dash_charge = max(snake.available_dash_charge - 1, 0);
        friction *= 0.1;
        accel_vec *= 2;
        dashing = true;
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
        if dashing {
            applied_gravity = 0;
        }

        accel_vec.y += applied_gravity;
    }

    if !dashing {
        snake.available_dash_charge = min(snake.available_dash_charge + underground_strength * 0.5, max_dash_charge);
    }

    // in_ground := false;
    // for point: points {
    //     in_ground = in_ground || is_ground(cast(int) point.x, cast(int) point.y);
    // }

    // // if !in_ground {
    // //     acceleration.y = 0;
    // // }
    
    // acceleration = normalize(acceleration);

    // turn_strength :: (velocity: Vector2) -> float {
    //     return sqrt(length(velocity) + 1) / 4.0;
    // }

    // max_velocity :: 8;
    // if length(snake.velocity) <= max_velocity + 0.00001 {
    //     new_speed := length(snake.velocity + acceleration * 0.2);

    //     snake.velocity = normalize(snake.velocity + turn_strength(snake.velocity) * acceleration) * new_speed;
    //     if length(snake.velocity) > max_velocity {
    //         snake.velocity = normalize(snake.velocity) * max_velocity;
    //     }
    // } else {
    //     original_speed := length(snake.velocity);

    //     new_speed := length(snake.velocity + acceleration * 0.2);

    //     snake.velocity = normalize(snake.velocity + turn_strength(snake.velocity) * acceleration) * new_speed;
    //     if length(snake.velocity) > max_velocity {
    //         friction := ifx in_ground then gravity * 4 else gravity * 0.1;
    //         speed := length(snake.velocity) - friction;
    //         snake.velocity = normalize(snake.velocity) * max(speed, max_velocity);
    //     }
    // }

    old_velocity := snake.velocity;

    snake.velocity += accel_vec;

    friction_force := snake.velocity * (underground_strength / 2.0 + 0.5);
    magnitude_squared := length_squared(friction_force);
    friction_force = normalize(-friction_force) * max(magnitude_squared * friction, 0.1);

    snake.velocity += friction_force;
    
    snake.position += snake.velocity;

    // if !in_ground {
    //     snake.velocity.y += gravity;
    // }

    add_history(*snake.history, snake.position, cast(float) snake_image.width);
    snake.points, snake.point_count = get_points(snake.history, 20, cast(float) snake_image.width);

    add_packet(context.room_id, RoomSetPositionVelocityPacket.{
        id = snake.id,
        position = snake.position,
        velocity = old_velocity,
    });
}

SnakeManager :: struct {
    snakes: BlockAllocator(Snake);
    snake_lookup: Table(u32, *Snake);
}

create_snake :: (id: u32) -> *Snake {
    snake := claim(*context.snake_manager.snakes);
    snake.id = id;
    snake.position = .{1343, 729};

    table_set(*context.snake_manager.snake_lookup, id, snake);

    return snake;
}

remove_snake :: (id: u32) {
    snake, found := table_find(*context.snake_manager.snake_lookup, id);
    assert(found, "Tried to remove snake that doesn't exist.\n");
    if !found {
        return;
    }

    release(*context.snake_manager.snakes, snake);
    table_remove(*context.snake_manager.snake_lookup, id);
}

get_snake :: (id: u32) -> *Snake {
    snake, found := table_find(*context.snake_manager.snake_lookup, id);
    if !found {
        return null;
    }

    return snake;
}

snake_manager_update :: () {
    for *snake: context.snake_manager.snakes {
        update(snake);
    }
}
