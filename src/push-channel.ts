type Node<T> = { value: T; prev?: Node<T>; next?: Node<T> }
type LastResolver = (err?: any) => void

export function linkedList<T>() {
  let head: Node<T> | undefined = undefined
  let tail: Node<T> | undefined = undefined
  let _size = 0

  function size() {
    return _size
  }

  function enqueue(value: T) {
    const node: Node<T> = {
      value,
    }
    node.prev = tail
    if (tail) {
      tail.next = node
    }
    if (!head) {
      head = node
    }
    tail = node
    _size += 1
  }

  function remove(node: Node<T>): void {
    if (!node.next) {
      tail = node.prev
    } else {
      const nextNode = node.next
      nextNode.prev = node.prev
    }
    if (!node.prev) {
      head = node.next
    } else {
      const prevNode = node.prev
      prevNode.next = node.next
    }
    _size -= 1
  }

  // removes the head node and updates the head
  function dequeue(): T | undefined {
    const ret = head
    if (ret) {
      remove(ret)
      return ret.value
    }
    return undefined
  }

  // signals if the list is empty
  function isEmpty(): boolean {
    return !head
  }

    return { enqueue, dequeue, isEmpty, size }
}

/**
 * Creates a pushable channel
 * @public
 */
export function pushableChannel<T>(onIteratorClose: () => void) {
  let returnLock: (() => void) | null = null
  const queue = linkedList<{ value: T, resolve: LastResolver }>()
  let closed = false
  let error: Error | null = null

  function closeAllPending() {
    if (!queue.isEmpty()) {
      const err = error || new Error("Channel was closed before deliverying the message")
      while (!queue.isEmpty()) {
        const { resolve } = queue.dequeue()!
        if (resolve) resolve(err)
      }
    }
  }

  function releaseLockIfNeeded() {
    // signal that we have a value
    if (returnLock) {
      const originalReturnLock = returnLock
      returnLock = null
      originalReturnLock()
    }
  }

  function push(value: T, resolve: (err?: any) => void) {
    if (closed) {
      resolve(new Error("Channel is closed"))
      return
    }
    if (error) {
      resolve(error)
      return
    }
    // push the value to the queue
    queue.enqueue({ value, resolve })
    releaseLockIfNeeded()
  }

  function failAndClose(errorToThrow: Error) {
    error = errorToThrow
    close()
    closeAllPending()
  }

  function yieldNextResult(): IteratorResult<T> | void {
    if (error && queue.isEmpty()) {
      throw error
    }
    if (closed && queue.isEmpty()) {
      return { done: true, value: undefined }
    }
    if (!queue.isEmpty()) {
      const node = queue.dequeue()!
      if (node.resolve)
        node.resolve(error || undefined)
      return {
        done: false,
        value: node.value,
      }
    }
  }

  function close() {
    if (!closed) {
      closed = true
      releaseLockIfNeeded()
      onIteratorClose()
    }
  }

  const iterable: AsyncGenerator<T> = {
    async next() {
      while (true) {
        try {
          const result = yieldNextResult()
          if (result) {
            return result
          } else {
            await new Promise<void>((res) => (returnLock = res))
          }
        } catch (err: any) {
          failAndClose(err)
          throw err
        }
      }
    },
    async return(value) {
      close()
      closeAllPending()
      return { done: true, value }
    },
    async throw(e) {
      if (error) {
        throw error
      }
      failAndClose(e)
      return { done: true, value: undefined }
    },
    [Symbol.asyncIterator]() {
      return iterable
    },
  }

  function isClosed() {
    return closed
  }

  return { iterable, push, close, failAndClose, isClosed, [Symbol.asyncIterator]: () => iterable }
}
