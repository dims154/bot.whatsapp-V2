import { ToolRegistry } from "./ToolRegistry";
import { ToolManager } from "./ToolManager";

import { TimeTool } from "./system/TimeTool";
import { CalculatorTool } from "./system/CalculatorTool";

const registry =
    new ToolRegistry();

registry.register(
    new TimeTool()
);

registry.register(
    new CalculatorTool()
);

export const toolRegistry =
    registry;

export const toolManager =
    new ToolManager(registry);