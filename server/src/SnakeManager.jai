
bite_radius :: 8.0;
body_radius :: 12.0;

max_dash_charge :: 150.0;

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
    aabb: AABB2;
    killed: int;
    dead: bool;
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

    snake.velocity += accel_vec;

    friction_force := snake.velocity * (underground_strength / 2.0 + 0.5);
    magnitude_squared := length_squared(friction_force);
    friction_force = normalize(-friction_force) * max(magnitude_squared * friction, 0.1);

    snake.velocity += friction_force;
    
    snake.position += snake.velocity;

    add_history(*snake.history, snake.position, cast(float) snake_image.width);
    snake.points, snake.point_count = get_points(snake.history, 20, cast(float) snake_image.width);

    snake.aabb = calculate_snake_aabb(snake);
    create_proxy(*context.snake_manager.snake_tree, snake.aabb, snake);

    add_packet(context.room_id, RoomSetPositionVelocityPacket.{
        id = snake.id,
        time = cast(u32) context.time,
        position = snake.position,
        velocity = snake.velocity,
    });
}

calculate_snake_aabb :: (snake: *Snake) -> AABB2 {
    padding := max(bite_radius, body_radius);

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
    points: [] Vector2;
    points.data = snake.points.data;
    points.count = snake.point_count;

    if points.count < 2 {
        return;
    }

    head_line := Line2.{points[0], points[1]};

    for potential_snake: query(*context.snake_manager.snake_tree, snake.aabb) {
        if potential_snake == snake {
            continue;
        }

        enemy_points: [] Vector2;
        enemy_points.data = potential_snake.points.data;
        enemy_points.count = potential_snake.point_count;

        if enemy_points.count < 3 {
            continue;
        }

        for i: 1..enemy_points.count - 2 {
            curr_point := enemy_points[i];
            next_point := enemy_points[i + 1];

            enemy_body_line := Line2.{curr_point, next_point};
            _, _, _, _, bite_distance_squared := nearest_point(head_line, enemy_body_line);
            if bite_distance_squared <= bite_radius * bite_radius {
                snake.killed += 1;
                potential_snake.dead = true;
            }
        }
    }
}

SnakeManager :: struct {
    snakes: BlockAllocator(Snake);
    snake_lookup: Table(u32, *Snake);
    snake_tree: BoundingTree2(*Snake);
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
    tree_reset(*context.snake_manager.snake_tree);

    for *snake: context.snake_manager.snakes {
        update(snake);
    }

    for *snake: context.snake_manager.snakes {
        check_damage(snake);
    }

    for *snake: context.snake_manager.snakes {
        if snake.dead {
            add_packet(context.room_id, RoomRemoveEntityPacket.{
                id = snake.id,
            });

            remove;
        }
    }
}
