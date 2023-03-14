/* eslint-disable */

export default class WorkerBuilder extends Worker {
    constructor(worker) {
      let code = worker.toString();
      const blob = new Blob([`(${code})()`], { type: 'text/javascript' });
      return new Worker(URL.createObjectURL(blob), {
        type: 'module',
      });
    }
  }