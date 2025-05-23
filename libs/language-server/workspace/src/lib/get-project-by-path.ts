import { ProjectConfiguration } from '@nrwl/devkit';
import { directoryExists } from '@nx-console/shared/file-system';
import { isAbsolute, join, relative } from 'path';
import { nxWorkspace } from './workspace';

export async function getProjectByPath(
  selectedPath: string | undefined,
  workspacePath: string
): Promise<ProjectConfiguration | null> {
  if (!selectedPath) {
    return null;
  }

  const { workspace } = await nxWorkspace(workspacePath);

  const relativeFilePath = relative(workspacePath, selectedPath);
  const isDirectory = await directoryExists(selectedPath);

  const projectEntries = Object.entries(workspace.projects);
  let foundProject: ProjectConfiguration | null = null;

  for (const [projectName, projectConfig] of projectEntries) {
    const startsWithRoot = relativeFilePath.startsWith(projectConfig.root);
    const relativeRootConfig = projectConfig.sourceRoot
      ? relative(workspacePath, projectConfig.sourceRoot)
      : undefined;
    const startsWithRootConfig =
      relativeRootConfig && relativeFilePath.startsWith(relativeRootConfig);

    if (!projectConfig.files) {
      foundProject = findByFilePath(
        [projectName, projectConfig],
        workspacePath,
        selectedPath
      );
    } else if (isDirectory && (startsWithRoot || startsWithRootConfig)) {
      foundProject = projectConfig;
    } else if (
      !isDirectory &&
      projectConfig.files.some(({ file }) => file === relativeFilePath)
    ) {
      foundProject = projectConfig;
    }

    if (foundProject) {
      break;
    }
  }

  return foundProject;
}

/** This is only used for backwards compatibility  */
function findByFilePath(
  entry: [string, ProjectConfiguration] | undefined,
  workspacePath: string,
  selectedPath: string
) {
  if (!entry) {
    return null;
  }

  let perfectMatchEntry: [string, ProjectConfiguration] | undefined;
  let secondaryMatchEntry: [string, ProjectConfiguration] | undefined;

  const [, projectConfiguration] = entry;
  const fullProjectPath = join(
    workspacePath,
    // If root is empty, that means we're in an angular project with the old ng workspace setup. Otherwise use the sourceRoot
    projectConfiguration.root || projectConfiguration.sourceRoot || ''
  );
  if (fullProjectPath === selectedPath) {
    perfectMatchEntry = entry;
  }

  const relativePath = relative(fullProjectPath, selectedPath);
  if (
    relativePath &&
    !relativePath.startsWith('..') &&
    !isAbsolute(relativePath)
  ) {
    secondaryMatchEntry = entry;
  }

  entry = perfectMatchEntry ?? secondaryMatchEntry;

  return entry ? { name: entry[0], ...entry[1] } : null;
}
