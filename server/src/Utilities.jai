
// this function errs on the side of caution, some types aren't even considered
is_pod :: (T: Type, contiguous_only: bool) -> bool {
    info := cast(*Type_Info) T;

    if info.type == {
        case .INTEGER;
            return true;

        case .FLOAT;
            return true;

        case .BOOL;
            return true;

        case .ENUM;
            return true;

        case .STRUCT;
            struct_info := cast(*Type_Info_Struct) info;

            pod := true;
            expected_offset := 0;
            for member: struct_info.members {
                valid_offset := !contiguous_only || member.offset_in_bytes == expected_offset;
                pod = pod && valid_offset;

                // could a constant member be non-constant?
                is_pod_member := (member.flags & .CONSTANT) || is_pod((cast(*Type) *member.type).*, true);
                pod = pod && is_pod_member;

                expected_offset += member.type.runtime_size;
            }
            return pod;

        case .ARRAY;
            array_info := cast(*Type_Info_Array) info;

            pod := true;
            pod = pod && array_info.array_type == .FIXED;
            pod = pod && is_pod((cast(*Type) *array_info.element_type).*, true);
            return pod;

        case;
            return false;
    }
}


EfficientRemove :: struct (T: Type) {
    captured: *[] T;
}

efficient_remove :: (captured: *[] $T) -> EfficientRemove(T) {
    return EfficientRemove(T).{captured};
}

for_expansion :: (wrapper: EfficientRemove($T), body: Code, flags: For_Flags) #expand {
    // you can't efficiently remove in reverse as far as I can tell unless you manually reverse first
    #assert(!(flags & .REVERSE));

    insert_index := 0;
    check_index := 0;

    defer {
        // handle breaks
        while insert_index != check_index && check_index < wrapper.captured.count {
            wrapper.captured.*[insert_index] = wrapper.captured.*[check_index];

            insert_index += 1;
            check_index += 1;
        }

        wrapper.captured.count -= check_index - insert_index;
    };

    while check_index < wrapper.captured.count {
        #if flags & .POINTER {
            `it := *wrapper.captured.*[check_index];
        } else {
            `it := wrapper.captured.*[check_index];
        }

        `it_index := check_index;

        should_keep := true;
        defer if should_keep {
            if insert_index != check_index {
                wrapper.captured.*[insert_index] = wrapper.captured.*[check_index];
            }

            insert_index += 1;
            check_index += 1;
        }
        #insert (remove={check_index += 1; should_keep = false;}) body;
    }
}
