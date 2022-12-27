import { error } from '@sveltejs/kit';
import { Logtail } from '@logtail/browser';
import { readpuz } from '@confuzzle/readpuz';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { R2_ENDPOINT, ACCESS_KEY, SECRET_KEY } from '$env/static/private';

const logtail = new Logtail('1AUqbfSc2uLekZ7MuLM8qwsE');

logtail.debug('instantiating r2 client');
const r2 = new S3Client({
	region: 'auto',
	endpoint: R2_ENDPOINT,
	credentials: {
		accessKeyId: ACCESS_KEY,
		secretAccessKey: SECRET_KEY
	}
});

export async function load({ params }) {
	logtail.debug('load puz start', params);
	if (!params.slug) {
		logtail.info("no slug, can't load puz file", params);
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
		logtail.error('error getting object from r2', e);
		return error(404);
	}

	let puz;
	try {
		const puzBytes = await res.Body?.transformToByteArray();
		puz = readpuz(puzBytes);
	} catch (e: any) {
		logtail.error('error parsing puz bytes', e);
		return error(404);
	}

	// Some binary stuff we don't care about
	delete puz.sections;

	return { puz };
}
