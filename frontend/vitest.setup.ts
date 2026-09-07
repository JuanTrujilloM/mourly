import '@testing-library/jest-dom/vitest';

// jsdom ships <dialog> without showModal/close, so anything built on Modal
// would render inert and hide its contents from role queries.
HTMLDialogElement.prototype.showModal = function showModal() {
  this.open = true;
};
HTMLDialogElement.prototype.close = function close() {
  this.open = false;
  this.dispatchEvent(new Event('close'));
};

// jsdom has no IntersectionObserver, so Reveal would throw on mount. The stub
// never fires: revealed content stays in the DOM at opacity 0, still queryable.
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
globalThis.IntersectionObserver =
  IntersectionObserverStub as unknown as typeof IntersectionObserver;
