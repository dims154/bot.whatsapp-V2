import { Condition } from "../condition/Condition";

export interface WorkflowStep {

    id: string;

    tool: string;

    input: string;

    parallel?: boolean;

    condition?: Condition;

}