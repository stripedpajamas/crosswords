import { fail } from '@sveltejs/kit';
import { readpuz } from '@confuzzle/readpuz';
import hash from '@sindresorhus/string-hash';
import type { RequestEvent } from './$types';

export const actions = {
	default: async (event: RequestEvent) => {
		const formData = await event.request.formData();
		const puzUrl = formData.get('url')?.toString();

		if (!puzUrl) {
			return fail(400);
		}

		let res, bytes, puz;
		try {
			res = await fetch(puzUrl);
			bytes = await res.arrayBuffer();
		} catch (e: any) {
			console.error('failed to download puz file', e);
			return fail(500, { message: `error downloading: ${e.message}` });
		}

		try {
			puz = readpuz(bytes);
			delete puz.sections; // Some binary stuff we don't care about
		} catch (e: any) {
			console.error('failed to parse puz file', e, bytes);
			return fail(500, { message: `error parsing: ${e.message}` });
		}

		const puzJson = JSON.stringify(puz);
		const key = hash(puzJson).toString(32);
		try {
			await event.platform.env?.R2_BUCKET.put(key, puzJson);
		} catch (e: any) {
			console.error('error uploading puz json', e);
			return fail(500, { message: `error uploading: ${e.message}` });
		}

		return { success: true, key };
	}
};
