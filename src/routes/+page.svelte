<script lang="ts">
	import type { PageServerData } from './$types';

	export let data: PageServerData;
</script>

{#if !data.toc.length}
<p>Nothing to see here!</p>
{/if}
  
<ul>
	{#each data.toc as entry}
		<li><a href="/puz/{entry.key}">{entry.title} - ({entry.author})</a></li>
	{/each}
</ul>
