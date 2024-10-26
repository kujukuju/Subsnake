use_plugin_first :: (raw_workspace: Workspace, raw_plugins: [$N] *Metaprogram_Plugin) {
    workspace = raw_workspace;
    plugins = array_copy(raw_plugins);

    for plugin: plugins {
        plugin.workspace = workspace;
    }

    intercept_flags: Intercept_Flags;

    for plugin: plugins {
        if plugin.before_intercept plugin.before_intercept(plugin, *intercept_flags);
    }
    
    compiler_begin_intercept(workspace, intercept_flags);

    for plugin: plugins {
        if plugin.add_source plugin.add_source(plugin);
    }
}

use_plugin_last :: () {
    wants_messages := false;
    for plugin: plugins {
        wants_messages = wants_messages || plugin.message;
    }

    if wants_messages {
        while true {
            message := compiler_wait_for_message();

            for plugin: plugins {
                if plugin.message then plugin.message(plugin, message);
            }

            if message.kind == .COMPLETE break;
        }
    }

    compiler_end_intercept(workspace);

    for plugin: plugins {
        if plugin.finish plugin.finish(plugin);
        if plugin.shutdown plugin.shutdown(plugin);
    }
}

#scope_file

workspace: Workspace;
plugins: [] *Metaprogram_Plugin;
