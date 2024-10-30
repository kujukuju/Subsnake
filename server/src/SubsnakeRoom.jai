
DESIRED_CONNECTIONS :: 32;

#add_context time: float64;
#add_context room_id: int;
#add_context loop_semaphore: *Semaphore;
#add_context done_semaphore: *Semaphore;
#add_context snake_manager: SnakeManager;
#add_context food_manager: FoodManager;
#add_context spawn_manager: SpawnManager;
#add_context level: Level;

run_room :: (thread: *Thread) -> int {
    information := cast(*RoomInformation) thread.data;

    context.room_id = information.room_id;
    context.loop_semaphore = *information.loop_semaphore;
    context.done_semaphore = *information.done_semaphore;

    context.snake_manager.snake_tree = create_bounding_tree2(*Snake);

    load_level();
    load_food();
    load_spawns();

    loop_room();

    return 0;
}

loop_room :: () {
    while true {
        reset_temporary_storage();
        
        wait_for(context.loop_semaphore);

        context.time = seconds_since_init() * 1000;

        events := get_events(context.room_id);
        process_events(events);

        food_manager_update();
        snake_manager_update();

        signal(context.done_semaphore);
    }
}
