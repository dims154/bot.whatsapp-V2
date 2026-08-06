export interface Condition {

    left: string;

    operator:
        "=="
        | "!="
        | ">"
        | "<"
        | ">="
        | "<=";

    right: string;

}