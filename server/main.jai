#import "Basic";
#import "Compiler";
#import "File";
#import "File_Utilities";
#import "String";

#load "use_plugin.jai";

MetaThreadSafe :: #import,file "../../MetaThreadSafe/module.jai";
MetaAssertDiscard :: #import,file "../../MetaAssertDiscard/module.jai";

build :: () {
    context.allocator = temp;
    
    release := is_release();
    if release then print("Building release mode.\n");

    current_workspace := get_current_workspace();
    set_build_options_dc(.{do_output = false}, current_workspace);

    workspace := compiler_create_workspace("Subsnake Server");
    options := get_build_options(workspace);
    options.output_type = .EXECUTABLE;
    options.output_executable_name = "main";
    options.temporary_storage_size = 2097152;
    options.import_path = .["C:/jai/modules", #run tprint("%../../", #filepath), "/usr/jai/modules"];

    if release {
        set_optimization(*options, .VERY_OPTIMIZED);
    } else {
        set_optimization(*options, .DEBUG);
    }

    thread_safety := MetaThreadSafe.get_plugin();
    assert_discard := MetaAssertDiscard.get_plugin(.[
        "ends_with",
        "starts_with",
        "begins_with",
        "is_false",
        "is_float_char",
        "length_squared",
        "enum_count",
        "matches_attributes",
        "span_is_fully_utilized",
        "table_find_pointer",
        "atomic_load",
        "is_true_or_false",
        "is_true",
        "is_unsigned_int_char",
        "is_valid_after_number",
        "is_integer_or_float",
        "table_contains",
        "abs",
        "has_uniform",
        "is_pod",
        "distance",
        "is_signed_int_char",
        "is_leaf",
        "is_null",
        "detect_convex_hull",
        "get_stride",
        "memcmp",
        "PxConvexMeshGeometry_isValid",
        "PxTriangleMeshGeometry_isValid",
        "is_walkable",
        "is_wall",
        "get_children_size",
        "length",
        "cross",
    ]);
    use_plugin_first(workspace, .[thread_safety, assert_discard]);
    defer use_plugin_last();

    print("Module folders: %\n", options.import_path);
    set_build_options(options, workspace);
    set_working_directory(#filepath);

    if release {
        add_build_string("PRODUCTION :: true;\n", workspace);
    } else {
        add_build_string("PRODUCTION :: false;\n", workspace);
    }

    // source files
    files := file_list(tprint("%src", #filepath), true);
    for file: files {
        if !ends_with(file, ".jai") {
            continue;
        }

        add_build_file(file, workspace);
    }
}

is_release :: () -> bool {
    args := get_build_options().compile_time_command_line;

    for args {
        if it == "release" {
            return true;
        }
    }

    return false;
}

#run,stallable build();
