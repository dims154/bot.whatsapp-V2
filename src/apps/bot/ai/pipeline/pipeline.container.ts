import { AIPipeline } from "./AIPipeline";

import { MemoryStage } from "./stages/MemoryStage";
import { PersonaStage } from "./stages/PersonaStage";
import { SafetyStage } from "./stages/SafetyStage";
import { PromptStage } from "./stages/PromptStage";
import { ProviderStage } from "./stages/ProviderStage";
import { PostProcessStage } from "./stages/PostProcessStage";
import { LoggerStage } from "./stages/LoggerStage";
import { ToolStage } from "./stages/ToolStage";

export const aiPipeline = new AIPipeline([

    new MemoryStage(),

    new PersonaStage(),

    new SafetyStage(),

    new ToolStage(),

    new PromptStage(),

    new ProviderStage(),

    new PostProcessStage(),

    new LoggerStage()

]);