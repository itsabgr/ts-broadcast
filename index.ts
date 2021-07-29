export const Off = Symbol('Off')
type Callback<R extends []> = (...data: R) => ((typeof Off | void) | Promise<(typeof Off | void)>)
export class BC<Arguments extends []> {
  #set = new Set<Callback<Arguments>>()

  constructor() {
  }

  async push(...data: Arguments) {
    let fns = Array.from(this.#set.values())
    for (const fn of fns) {
      if (await fn(...data) === Off) {
        this.#set.delete(fn)
      }
    }
  }

  get count() {
    return this.#set.size
  }

  do(fn: Callback<Arguments>) {
    this.#set.add(fn)
    return fn
  }

  off(fn: Callback<Arguments>) {
    return this.#set.delete(fn)
  }

  wait(timeout?: number) {
    return new Promise<Arguments>((resolve, reject) => {
      this.do((...data) => {
        resolve(data)
        return Off
      })
      if (typeof timeout === 'number') {
        setTimeout(() => {
          reject(new Error('TIMEOUT'))
        })
      }
    })
  }
}

export default BC