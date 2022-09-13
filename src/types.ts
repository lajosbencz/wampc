export type Nullable<T> = T | undefined | null

export type ArrayOrObject = Args | KwArgs

export interface Dictionary<T> { [x: string]: T }
export interface NestedDictionary<T> { [x: string]: NestedDictionary<T> | T }

export type Args = any[]
export interface KwArgs { [key: string]: any }

export type TodoType = any
