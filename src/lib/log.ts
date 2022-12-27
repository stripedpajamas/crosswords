import { Logtail } from '@logtail/browser';
import { PUBLIC_LOCAL_DEV } from '$env/static/public';

export interface Logger {
  debug: (msg: string, ctx?: any) => void;
  info: (msg: string, ctx?: any) => void;
  warn: (msg: string, ctx?: any) => void;
  error: (msg: string, ctx?: any) => void;
}

class ConsoleLogger implements Logger {
  debug(msg: string, ctx?: any) {
    typeof ctx !== 'undefined' ? console.log(msg, ctx) : console.log(msg);
  }
  info(msg: string, ctx?: any) {
    typeof ctx !== 'undefined' ? console.log(msg, ctx) : console.log(msg);
  }
  warn(msg: string, ctx?: any) {
    typeof ctx !== 'undefined' ? console.warn(msg, ctx) : console.warn(msg);
  }
  error(msg: string, ctx?: any) {
    typeof ctx !== 'undefined' ? console.error(msg, ctx) : console.error(msg);
  }
}

// Everything to console and Logtail if not local
class DoubleLogger implements Logger {
  private outputs: Logger[];

  constructor() {
    this.outputs = [new ConsoleLogger()];
    if (PUBLIC_LOCAL_DEV !== 'true') {
      this.outputs.push(new Logtail('1AUqbfSc2uLekZ7MuLM8qwsE'));
    }
  }

  debug(msg: string, ctx?: any) {
    this.outputs.forEach(o => o.debug(msg, ctx));
  }
  info(msg: string, ctx?: any) {
    this.outputs.forEach(o => o.info(msg, ctx));
  }
  warn(msg: string, ctx?: any) {
    this.outputs.forEach(o => o.warn(msg, ctx));
  }
  error(msg: string, ctx?: any) {
    this.outputs.forEach(o => o.error(msg, ctx));
  }
}

export const log = new DoubleLogger();