
Snake :: struct {
    id: u32;
    position: Vector2;
    velocity: Vector2;
    direction: Vector2;
    ground_ticks: int;
}

update :: (snake: *Snake) {
    gravity :: 0.4;

    acceleration := snake.direction;

    if is_ground(cast(int) snake.position.x, cast(int) snake.position.y) {
        snake.ground_ticks = 4;
    } else {
        snake.ground_ticks = max(snake.ground_ticks - 1, 0);
        acceleration.y = 0;
    }

    in_ground := snake.ground_ticks > 0;
    
    acceleration = normalize(acceleration);

    turn_strength :: (velocity: Vector2) -> float {
        return sqrt(length(velocity) + 1) / 4.0;
    }

    max_velocity :: 8;
    if length(snake.velocity) <= max_velocity + 0.00001 {
        new_speed := length(snake.velocity + acceleration * 0.2);

        snake.velocity = normalize(snake.velocity + turn_strength(snake.velocity) * acceleration) * new_speed;
        if length(snake.velocity) > max_velocity {
            snake.velocity = normalize(snake.velocity) * max_velocity;
        }
    } else {
        original_speed := length(snake.velocity);

        new_speed := length(snake.velocity + acceleration * 0.2);

        snake.velocity = normalize(snake.velocity + turn_strength(snake.velocity) * acceleration) * new_speed;
        if length(snake.velocity) > max_velocity {
            friction := ifx in_ground then gravity * 4 else gravity * 0.1;
            speed := length(snake.velocity) - friction;
            snake.velocity = normalize(snake.velocity) * max(speed, max_velocity);
        }
    }
    
    snake.position += snake.velocity;

    if !in_ground {
        snake.velocity.y += gravity;
    }

    add_packet(context.room_id, RoomSetPositionVelocityPacket.{
        id = snake.id,
        position = snake.position,
        velocity = snake.velocity,
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
