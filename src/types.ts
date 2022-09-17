export type Optional<T> = T | undefined;

export type ArrayOrObject = Args | KwArgs;

export interface Dictionary<T> {
    [x: string]: T;
}
export interface NestedDictionary<T> {
    [x: string]: NestedDictionary<T> | T;
}

export type Args = any[];
export interface KwArgs {
    [key: string]: any;
}

export type SubscriptionHandler = (args?: Args, kwArgs?: KwArgs, details?: KwArgs) => void
export type RegistrationCallback = (args?: Args, kwArgs?: KwArgs, details?: KwArgs) => any|Promise<any>

export type TodoType = any;
