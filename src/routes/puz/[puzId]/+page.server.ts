import { error } from '@sveltejs/kit';
import type { PageServerLoadEvent } from './$types';
import example from '$lib/data/example';

export async function load({ params, platform }: PageServerLoadEvent) {
	if (!platform || !platform.env) {
		return { puz: example };
	}

	let res, puz;
	try {
		res = await platform.env?.R2_BUCKET.get(params.puzId)
		if (!res) {
			throw error(404);
		}
	} catch (e: any) {
		console.error('error getting puz from r2', e, res);
		throw error(404);
	}

	try {
		puz = await res.json();
	} catch (e: any) {
		console.error('error parsing puz json', e)
		throw error(500);
	}

	return { puz };
}
