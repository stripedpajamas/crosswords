import { log } from '$lib/log';
import type { HandleClientError } from '@sveltejs/kit';

export const handleError: HandleClientError = ({ error, event }) => {
	try {
		log.error('unexpected client error', {
			error: error as any,
			event: JSON.stringify(event)
		});
	} catch (e) {}
};
