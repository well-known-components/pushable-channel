## API Report File for "@well-known-components/pushable-channel"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

// @public
export class AsyncQueue<T> implements AsyncGenerator<T> {
    // (undocumented)
    [Symbol.asyncIterator](): AsyncGenerator<T>;
    constructor(requestingNext: (queue: AsyncQueue<T>, action: "next" | "close") => void);
    // (undocumented)
    close(error?: Error): void;
    // (undocumented)
    closed: boolean;
    // (undocumented)
    enqueue(value: T): void;
    // (undocumented)
    error: Error | undefined;
    // (undocumented)
    next(): Promise<IteratorResult<T>>;
    // (undocumented)
    return(value: any): Promise<IteratorResult<T>>;
    // (undocumented)
    settlers: {
        enqueue: (value: {
            resolve(x: IteratorResult<T>): void;
            reject(error: Error): void;
        }) => void;
        dequeue: () => {
            resolve(x: IteratorResult<T>): void;
            reject(error: Error): void;
        } | undefined;
        isEmpty: () => boolean;
        size: () => number;
    };
    // (undocumented)
    throw(error: Error): Promise<IteratorResult<T>>;
    // (undocumented)
    values: {
        enqueue: (value: IteratorResult<T, any>) => void;
        dequeue: () => IteratorResult<T, any> | undefined;
        isEmpty: () => boolean;
        size: () => number;
    };
}

// @public
export function linkedList<T>(): {
    enqueue: (value: T) => void;
    dequeue: () => T | undefined;
    isEmpty: () => boolean;
    size: () => number;
};

// @public
export function pushableChannel<T>(onIteratorClose: () => void): {
    iterable: AsyncGenerator<T, any, unknown>;
    bufferSize: () => number;
    push: (value: T, resolve: (err?: any) => void) => void;
    close: () => void;
    failAndClose: (errorToThrow: Error) => void;
    isClosed: () => boolean;
    [Symbol.asyncIterator]: () => AsyncGenerator<T, any, unknown>;
};

// (No @packageDocumentation comment for this package)

```
