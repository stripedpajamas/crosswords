import { error } from '@sveltejs/kit';
import type { PageServerLoadEvent } from './$types';
import type { KVNamespaceListResult } from '@cloudflare/workers-types';
import type { PuzzleMetadataShort, PuzzleMetadataWithKey } from '$lib/types';

export async function load({ platform }: PageServerLoadEvent) {
  if (!platform || !platform.env) { // local dev
    return { toc: [{ key: 'asdf', author: 'Pete', title: 'Foo Bar', imported: Date.now() }] };
  }

	let res;
	try {
		res = await platform.env?.KV.list();
	} catch (e: any) {
		console.error('error getting toc from kv', e, res);
		throw error(500);
	}

	const toc: PuzzleMetadataWithKey[] = (res as KVNamespaceListResult<PuzzleMetadataShort>).keys.map(
		({ name, metadata }) => ({ key: name, ...metadata! })
	);
  toc.sort((a, b) => a.imported - b.imported)

	return { toc };
}
