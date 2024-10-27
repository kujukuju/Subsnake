
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
