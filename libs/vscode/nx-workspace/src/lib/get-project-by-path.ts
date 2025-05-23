import { ProjectConfiguration } from '@nrwl/devkit';
import { NxProjectByPathRequest } from '@nx-console/language-server/types';
import { sendRequest } from '@nx-console/vscode/lsp-client';

export async function getProjectByPath(
  selectedPath: string | undefined
): Promise<ProjectConfiguration | null> {
  return sendRequest(NxProjectByPathRequest, { projectPath: selectedPath });
}
