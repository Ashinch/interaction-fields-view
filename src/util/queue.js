export class Queue {
  constructor(maxLength) {
    this.queue = []
    this.maxLength = maxLength || -1
  }

  enqueue(item) {
    if (this.maxLength !== -1 && this.queue.length >= this.maxLength) {
      this.queue.shift()
    }
    this.queue.push(item)
  }

  dequeue() {
    return this.queue.shift()
  }

  isEmpty() {
    return this.queue.length === 0
  }

  clear() {
    this.queue = []
  }

  size() {
    return this.queue.length
  }
}

export class IntQueue extends Queue {
  sum() {
    return this.queue.reduce((a, b) => a + b, 0)
  }
}
