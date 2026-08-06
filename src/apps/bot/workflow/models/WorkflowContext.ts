import { Workflow } from "./Workflow";

export interface WorkflowContext {

    prompt: string;

    workflow: Workflow;

    variables: Record<string, unknown>;

}
