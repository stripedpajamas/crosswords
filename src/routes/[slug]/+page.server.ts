import { error } from '@sveltejs/kit';
import { log } from '$lib/log';
import { readpuz } from '@confuzzle/readpuz';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { R2_ENDPOINT, ACCESS_KEY, SECRET_KEY } from '$env/static/private';

log.debug('instantiating r2 client');
const r2 = new S3Client({
	region: 'auto',
	endpoint: R2_ENDPOINT,
	credentials: {
		accessKeyId: ACCESS_KEY,
		secretAccessKey: SECRET_KEY
	}
});


export async function load({ params }) {
	log.debug('load puz start', params);
	if (!params.slug) {
		log.info("no slug, can't load puz file", params);
		return error(404);
	}

	let res;
	try {
		res = await r2.send(
			new GetObjectCommand({
				Bucket: 'crosswords',
				Key: params.slug
			})
		);
	} catch (e: any) {
		log.error('error getting object from r2', e);
		return error(404);
	}

	let puz;
	try {
		const puzBytes = await res.Body?.transformToByteArray();
		puz = readpuz(puzBytes);
	} catch (e: any) {
		log.error('error parsing puz bytes', e);
		return error(404);
	}

	// Some binary stuff we don't care about
	delete puz.sections;

	return { puz };
}
