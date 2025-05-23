package dev.nx.console.utils

import com.intellij.openapi.project.Project
import dev.nx.console.settings.NxConsoleProjectSettingsProvider

/**
 * Get the base path of the current Nx project. Will get the settings first, then default to the
 * `basePath`
 */
val Project.nxBasePath: String
    get() =
        NxConsoleProjectSettingsProvider.getInstance(this).workspacePath
            ?: basePath ?: throw IllegalStateException("Base path is not found for project")
