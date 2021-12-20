import { GrpcObject } from '../src/make-client';
export declare function mockFunction(): never;
export declare namespace assert2 {
    /**
     * Assert that the given function doesn't throw an error, and then return
     * its value.
     * @param fn The function to evaluate.
     */
    function noThrowAndReturn<T>(fn: () => T): T;
    function clearMustCalls(): void;
    /**
     * Wraps a function to keep track of whether it was called or not.
     * @param fn The function to wrap.
     */
    function mustCall<T>(fn: (...args: any[]) => T): (...args: any[]) => T;
    /**
     * Calls the given function when every function that was wrapped with
     * mustCall has been called.
     * @param fn The function to call once all mustCall-wrapped functions have
     *           been called.
     */
    function afterMustCallsSatisfied(fn: () => void): void;
}
export declare function loadProtoFile(file: string): GrpcObject;
