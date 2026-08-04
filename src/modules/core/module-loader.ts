import { IModule } from './module.interface';

export class ModuleLoader {
  private modules: Record<string, IModule> = {};

  register(module: IModule): void {
    this.modules[module.metadata.name] = module;
  }

  getModule(name: string): IModule | undefined {
    return this.modules[name];
  }

  getActiveModules(): IModule[] {
    return Object.values(this.modules).filter((module) => module.metadata.active);
  }
}
