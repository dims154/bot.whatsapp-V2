import { Condition } from "./Condition";

export class ConditionEvaluator {

    evaluate(
        condition: Condition
    ): boolean {

        const left =
            Number(condition.left);

        const right =
            Number(condition.right);

        switch (
            condition.operator
        ) {

            case ">":
                return left > right;

            case "<":
                return left < right;

            case ">=":
                return left >= right;

            case "<=":
                return left <= right;

            case "==":
                return left === right;

            case "!=":
                return left !== right;

            default:
                return false;

        }

    }

}