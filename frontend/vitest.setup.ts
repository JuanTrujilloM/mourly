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
