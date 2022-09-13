import { Args, KwArgs } from '../types'
import Result from './result'


export enum ErrorCode {
    SUCCESS = 0,
    URI_ERROR = 1,
    NO_BROKER = 2,
    NO_CALLBACK_SPEC = 3,
    INVALID_PARAM = 4,
    NO_SERIALIZER_AVAILABLE = 6,
    NON_EXIST_UNSUBSCRIBE = 7,
    NO_DEALER = 12,
    RPC_ALREADY_REGISTERED = 15,
    NON_EXIST_RPC_UNREG = 17,
    NON_EXIST_RPC_INVOCATION = 19,
    NON_EXIST_RPC_REQ_ID = 20,
    NO_REALM = 21,
    NO_WS_OR_URL = 22,
    NO_CRA_CB_OR_ID = 23,
    CRA_EXCEPTION = 24,
}

export const ErrorMessage = {
    [ErrorCode.SUCCESS]: 'Success!',
    [ErrorCode.URI_ERROR]: "Topic URI doesn't meet requirements!",
    [ErrorCode.NO_BROKER]: "Server doesn't provide broker role!",
    [ErrorCode.NO_CALLBACK_SPEC]: 'No required callback function specified!',
    [ErrorCode.INVALID_PARAM]: 'Invalid parameter(s) specified!',
    [ErrorCode.NO_SERIALIZER_AVAILABLE]:
        'Server has chosen a serializer, which is not available!',
    [ErrorCode.NON_EXIST_UNSUBSCRIBE]:
        'Trying to unsubscribe from non existent subscription!',
    [ErrorCode.NO_DEALER]: "Server doesn't provide dealer role!",
    [ErrorCode.RPC_ALREADY_REGISTERED]: 'RPC already registered!',
    [ErrorCode.NON_EXIST_RPC_UNREG]:
        'Received rpc unregistration for non existent rpc!',
    [ErrorCode.NON_EXIST_RPC_INVOCATION]:
        'Received invocation for non existent rpc!',
    [ErrorCode.NON_EXIST_RPC_REQ_ID]:
        'No RPC calls in action with specified request ID!',
    [ErrorCode.NO_REALM]: 'No realm specified!',
    [ErrorCode.NO_WS_OR_URL]:
        'No websocket provided or URL specified is incorrect!',
    [ErrorCode.NO_CRA_CB_OR_ID]:
        'No onChallenge callback or authid was provided for authentication!',
    [ErrorCode.CRA_EXCEPTION]:
        'Exception raised during CRA challenge processing',
}


export default class Error extends Result {
    public error: string = ''
    constructor(error: string, args?: Args, kwArgs?: KwArgs) {
        super(args, kwArgs)
        this.error = error
    }
}
