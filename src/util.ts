export async function asPromise(callback: (...args: any) => any, ...args: any): Promise<any> {
    return await new Promise<any>((resolve, reject) => {
        try {
            resolve(callback.call(callback, ...args));
        } catch (e) {
            reject(e);
        }
    });
}

// https://stackoverflow.com/a/37492399/1378682
export function asCancelablePromise<T>(p: Promise<T>): any {
    let hasCanceled_ = false;
    const wrappedPromise = new Promise<T>((resolve, reject) => {
        p.then(val => (hasCanceled_ ? reject({ isCanceled: true }) : resolve(val)));
        p.catch(error => (hasCanceled_ ? reject({ isCanceled: true }) : reject(error)));
    });
    return {
        promise: wrappedPromise,
        cancel() {
            hasCanceled_ = true;
        },
    };
}
