export class SchedulerJob {

    constructor(

        public name: string,

        public interval: number,

        public callback: () => Promise<void> | void

    ) {}

}