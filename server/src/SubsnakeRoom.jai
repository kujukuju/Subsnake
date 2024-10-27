
#add_context room_id: int;
#add_context loop_semaphore: *Semaphore;
#add_context done_semaphore: *Semaphore;
#add_context snake_manager: SnakeManager;
#add_context level: Level;

run_room :: (thread: *Thread) -> int {
    information := cast(*RoomInformation) thread.data;

    context.room_id = information.room_id;
    context.loop_semaphore = *information.loop_semaphore;
    context.done_semaphore = *information.done_semaphore;

    load_level();

    loop_room();

    return 0;
}

loop_room :: () {
    while true {
        reset_temporary_storage();
        
        wait_for(context.loop_semaphore);

        events := get_events(context.room_id);
        process_events(events);

        snake_manager_update();

        signal(context.done_semaphore);
    }
}
