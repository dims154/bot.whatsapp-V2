export interface AIStage<T = any> {

    readonly name: string;

    execute(context: T): Promise<T>;

}