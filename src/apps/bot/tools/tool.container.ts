import { ToolRegistry } from "./ToolRegistry";
import { ToolManager } from "./ToolManager";

import { TimeTool } from "./system/TimeTool";
import { CalculatorTool } from "./system/CalculatorTool";
import { KnowledgeTool } from "./knowledge/KnowledgeTool";

const registry = new ToolRegistry();

registry.register(
    new TimeTool()
);

registry.register(
    new CalculatorTool()
);

registry.register(
    new KnowledgeTool()
);

export const toolRegistry = registry;

export const toolManager =
    new ToolManager(registry);