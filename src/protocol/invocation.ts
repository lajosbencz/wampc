export default class Invocation {
    procedure: any;
    progress: any;
    caller: any;
    caller_authid: string = '';
    caller_authrole: string = '';

    constructor(procedure: any, progress: any, caller: any, caller_authid: string, caller_authrole: string) {
        this.procedure = procedure;
        this.progress = progress;
        this.caller = caller;
        this.caller_authid = caller_authid;
        this.caller_authrole = caller_authrole;
    }
}
