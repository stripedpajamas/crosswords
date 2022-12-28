<script lang="ts">
	export let selected: boolean;
	export let inSelectedWord: boolean;
	export let filler: boolean;
	export let blank: boolean;
	export let value: string;
	export let ref: any = null;

	let displayValue: string;
	$: displayValue = blank || filler ? ' ' : value;
</script>

<button
	class:filler
	class:blank
	class:selected
	class:inSelectedWord
	on:click
	on:keyup
	bind:this={ref}
>
	<p>{displayValue}</p>
</button>

<style lang="scss">
	button {
		border: 1px solid black;
		display: grid;
		justify-content: center;
		align-content: center;
		text-align: center;
		width: 100%;
		font-size: 24px;
		background-color: white;

		&:hover:not(.filler) {
			filter: brightness(90%);
		}
	}

	.filler {
		background-color: black;
	}

	.inSelectedWord.selected {
		background-color: rgba(135, 206, 250);
	}

	.inSelectedWord {
		background-color: rgba(135, 206, 250, 0.4);
	}
</style>
