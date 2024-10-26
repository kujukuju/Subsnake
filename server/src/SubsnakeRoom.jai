
#add_context loop_semaphore: *Semaphore;

run_room :: (thread: *Thread) -> int {
    information := cast(*RoomInformation) thread.data;

    context.loop_semaphore = *information.loop_semaphore;

    loop_room();

    return 0;
}

loop_room :: () {
    while true {
        wait_for(context.loop_semaphore);

        print("Running!\n");

        signal(context.loop_semaphore);
    }
}
