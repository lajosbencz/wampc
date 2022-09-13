import { asCancelablePromise, asPromise } from './util'

describe('testing utils', () => {
    test('callback as promise', async () => {
        const r = await asPromise(() => {
            return '_test'
        })
        expect(r).toBe('_test')
    })
    test('cancellable promise', async () => {
        const p = new Promise((resolve, reject) => {
            setTimeout(() => resolve(true), 100)
        })
        let erred = false
        const c = asCancelablePromise(p)
        c.cancel()
        try {
            const res = await c.promise
        } catch (err: any) {
            erred = true
            expect(err.isCanceled).toBe(true)
        }
        expect(erred).toBe(true)
    })
})