declare module "node:test" {
  export function describe(name: string, fn: () => void): void
  export function it(name: string, fn: () => void): void
}

declare module "node:assert/strict" {
  function assert(value: unknown, message?: string): asserts value
  namespace assert {
    function equal(actual: unknown, expected: unknown, message?: string): void
    function deepEqual(actual: unknown, expected: unknown, message?: string): void
  }
  export default assert
}
