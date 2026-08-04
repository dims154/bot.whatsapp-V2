export interface ModuleMetadata {
  name: string;
  description: string;
  active: boolean;
  dependencies?: string[];
}

export interface IModule {
  metadata: ModuleMetadata;
  register(): void;
}
