import { Args, KwArgs } from '../types'

export default class Result {
    args?: Args = []
    kwArgs?: KwArgs = {}

    constructor(args?: Args, kwArgs?: KwArgs) {
        this.args = args
        this.kwArgs = kwArgs
    }
}
