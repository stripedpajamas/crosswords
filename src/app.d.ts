// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types

/// <reference types="@sveltejs/adapter-cloudflare-workers" />

declare namespace App {
	// interface Error {}
	// interface Locals {}
	// interface PageData {}
	interface Platform {
		env?: {
			R2_BUCKET: R2Bucket,
			KV: KVNamespace
		}
	}
}

declare module '@confuzzle/readpuz';