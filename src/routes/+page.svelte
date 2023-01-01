<script lang="ts">
	import type { PageServerData } from './$types';

	export let data: PageServerData;
</script>

<main>
	{#if !data.toc.length}
		<p>Nothing to see here!</p>
	{:else}
		<h2>Puzzles</h2>
		<ul>
			{#each data.toc as entry}
				<li><a href="/puz/{entry.key}">{entry.title} - ({entry.author})</a></li>
			{/each}
		</ul>
	{/if}
</main>

<style lang="scss">
	main {
		margin: 5em;
	}
	h2 {
		margin-bottom: 2em;
	}
</style>
