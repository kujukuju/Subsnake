
History :: struct {
    entries: [..] Vector2;
}

free :: (history: History) {
    array_free(history.entries);
}

add_history :: (history: *History, position: Vector2, max_length: float) {
    array_insert_at(*history.entries, position, 0);

    current_length: float;
    last_valid_index := 0;

    for i: 0..history.entries.count - 2 {
        curr_point := history.entries[i];
        next_point := history.entries[i + 1];

        current_length += distance(curr_point, next_point);
        if current_length <= max_length {
            last_valid_index = i + 2;
        }
    }

    if last_valid_index < history.entries.count - 1 {
        history.entries.count = last_valid_index + 1;
    }
}

get_points :: (history: History, $count: int, max_length: float) -> [count] Vector2, int {
    points: [count] Vector2;

    if history.entries.count == 0 {
        return points, 0;
    }

    distance_inc := max_length / (count - 1);

    next_distance := 0.0;
    next_index := 0;

    acc_distance := 0.0;

    for i: 0..history.entries.count - 2 {
        curr_point := history.entries[i];
        next_point := history.entries[i + 1];

        segment_distance := distance(curr_point, next_point);

        while next_distance >= acc_distance && next_distance < acc_distance + segment_distance {
            progress := clamp((next_distance - acc_distance) / segment_distance, 0, 1);
            points[next_index] = (next_point - curr_point) * progress + curr_point;

            next_distance += distance_inc;
            next_index += 1;

            if next_index >= count {
                return points, next_index;
            }
        }

        acc_distance += segment_distance;
    }

    return points, next_index;
}
