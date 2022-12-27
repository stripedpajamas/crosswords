import { log } from '$lib/log';
import type { PageServerLoadEvent } from './$types';
 
export async function load({ params }: PageServerLoadEvent) {
  log.info('testing server files');
  return {
    ...params
  };
}