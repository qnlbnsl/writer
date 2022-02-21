import * as vscode from 'vscode';

type TrackingConfig = {
  id: string;
  name: string;
};

const trackingConfigIds: TrackingConfig[] = [
  {
    id: 'progress.trackFunctions',
    name: 'Functions',
  },
  {
    id: 'progress.trackClasses',
    name: 'Classes',
  },
  {
    id: 'progress.trackTypes',
    name: 'Types',
  },
];

const buildUnicodeProgressBar = (progress: number): string => {
  const numberOfFullBars = progress / 10;
  const fullBars = "█".repeat(numberOfFullBars);
  const emptySpace = "▁".repeat(10 - numberOfFullBars);
  return `|${fullBars}${emptySpace}|`;
};

export class ProgressOptionsProvider implements vscode.TreeDataProvider<ProgressBar> {
  private progress: number;

  constructor(progress: number) {
    this.progress = progress;
  }

  getTreeItem(element: ProgressBar): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): any[] {
    if (element?.id === 'progress') {
      return trackingConfigIds.map((config) => {
        return new ComponentOption(config);
      });
    }

    const bar = buildUnicodeProgressBar(this.progress);
    return [new ProgressBar(bar, this.progress)];
  }
}

class ProgressBar extends vscode.TreeItem {
  constructor(
    public readonly bar: string,
    public readonly progress: number,
  ) {
    super(bar, vscode.TreeItemCollapsibleState.Collapsed);
    this.id = "progress";
    this.tooltip = "Progress bar (click to toggle settings)";
    this.description = `${progress}%`;
  }
}

class ComponentOption extends vscode.TreeItem {
  constructor(
    config: TrackingConfig,
  ) {
    super(config.name, vscode.TreeItemCollapsibleState.None);
    this.tooltip = `Click to toggle ${config.name.toLowerCase()} in progress tracking`;

    const docWriterConfig = vscode.workspace.getConfiguration('docwriter');
    const configId = config.id;
    const isTrackingConfigInspect = docWriterConfig.inspect(configId);
    const isTracking = Boolean(docWriterConfig.get(configId));

    const isDefault = Boolean(isTrackingConfigInspect?.defaultValue);

    if (isDefault) {
      this.description = "Default";
    }

    this.iconPath = isTracking
      ? new vscode.ThemeIcon('circle-filled')
      : new vscode.ThemeIcon('circle-outline');

    const onClickCommand: vscode.Command = {
      title: 'Changing Tracking Config',
      command: 'docs.trackingTypeConfig',
      arguments: [config.id, !isTracking]
    };

    this.command = onClickCommand;
  }
}