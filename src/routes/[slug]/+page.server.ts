import { error } from '@sveltejs/kit';
import { readpuz } from '@confuzzle/readpuz';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { R2_ENDPOINT, ACCESS_KEY, SECRET_KEY } from '$env/static/private';

const r2 = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
});

export async function load({ params }) {
	if (!params.slug) {
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
	} catch (e) {
		console.error(e);
		return error(404);
	}
  const puzBytes = await res.Body?.transformToByteArray();
  const puz = readpuz(puzBytes);

  // Some binary stuff we don't care about
  delete puz.sections;

	return { puz };
}
