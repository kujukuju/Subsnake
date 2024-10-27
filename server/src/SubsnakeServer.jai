
TICKRATE :: 30;
TICK_MS :: 1000.0 / TICKRATE;

main :: () {
    server := mg_ws_server_create(7625);
    defer mg_ws_server_free(server);

    desired_room_count := 1;
    room_threads = NewArray(desired_room_count, Thread);

    for *room_thread: room_threads {
        information := New(RoomInformation);
        information.room_id = it_index;
        
        room_thread.data = information;

        init(*information.loop_semaphore);
        init(*information.done_semaphore);
        thread_init(room_thread, run_room);

        register_room(it_index);
    }

    for *room_thread: room_threads {
        thread_start(room_thread);
    }

    while true {
        reset_temporary_storage();
        
        start := seconds_since_init() * 1000;

        flush_connections(server);
        poll_connections(server);

        // distribute packets and connections

        // do stuff here
        for *room_thread: room_threads {
            information := cast(*RoomInformation) room_thread.data;
        
            signal(*information.loop_semaphore);
        }

        for *room_thread: room_threads {
            information := cast(*RoomInformation) room_thread.data;
        
            wait_for(*information.done_semaphore);
        }

        remaining := max(TICK_MS - (seconds_since_init() * 1000 - start), 0);
        remaining_sleep := max(remaining - 2, 0);
        while remaining > 0 {
            sleep_nanoseconds(cast(int) (remaining_sleep * 1000000));

            remaining = max(TICK_MS - (seconds_since_init() * 1000 - start), 0);
            remaining_sleep = max(remaining - 2, 0);
        }
    }
}

sleep_nanoseconds :: (nanoseconds: int) {
    #assert OS == .WINDOWS || OS == .LINUX "Invalid OS for accurate sleep.\n";

    SECS_TO_NANO :: 1000000000;

    #if OS == .WINDOWS {
        sleep_milliseconds(cast(s32) (nanoseconds / 1000000));
    } else #if OS == .LINUX {
        #import "POSIX";
        libc :: #system_library "libc";
        nanosleep :: (req: *timespec, rem: *timespec) -> int #foreign libc;

        sleep_timespec: timespec;
        sleep_timespec.tv_sec = nanoseconds / SECS_TO_NANO;
        sleep_timespec.tv_nsec = nanoseconds - sleep_timespec.tv_sec * SECS_TO_NANO;

        nanosleep(*sleep_timespec, null);
    }
}

RoomInformation :: struct {
    room_id: int;
    loop_semaphore: Semaphore;
    done_semaphore: Semaphore;
}

room_threads: [] Thread;

#import "Basic";
#import "Math";
#import "Thread";
#import "Hash_Table";
#import "stb_image";

#import "BlockAllocatorJai";
#import "mongooseJaiHelpers";
