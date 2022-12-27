import { log } from '$lib/log';
import type { HandleServerError } from '@sveltejs/kit';

export const handleError: HandleServerError = ({ error, event }) => {
	try {
		log.error('unexpected server error', {
			error: (error as any).message,
			event: JSON.stringify(event)
		});
	} catch (e) {}
};
