
SpawnManager :: struct {
    spawns: [..] Vector2;
}

get_valid_spawn :: () -> Vector2 {
    return context.spawn_manager.spawns[random_get() % cast(u64) context.spawn_manager.spawns.count];
}

load_spawns :: () {
    is_spawn :: (color: [4] u8) -> bool {
        return color[0] == 0 && color[1] == 0 && color[2] == 255 && color[3] == 255;
    }

    for y: 0..food_image.height - 1 {
        for x: 0..food_image.width - 1 {
            pixel := get_pixel(food_image, x, y);

            if is_spawn(pixel) {
                array_add(*context.spawn_manager.spawns, Vector2.{cast(float) x, cast(float) y});
            }
        }
    }

    spawn_count := context.spawn_manager.spawns.count;
    
    print("There are % spawns.\n", spawn_count);
}
