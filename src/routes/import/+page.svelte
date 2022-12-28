<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

{#if form?.message}
	<p>{form.message}</p>
{/if}
{#if form?.success}
	<p>Successfully imported! Puzzle ID: <a href="/puz/{form.key}">{form.key}</a></p>
{/if}
<form method="POST" use:enhance>
	<label> puz url <input name="url" type="url" /> </label>
	<button>Import</button>
</form>
