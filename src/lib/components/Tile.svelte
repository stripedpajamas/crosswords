<script lang="ts">
	import { Puzzle } from '$lib/data/puzzle';

	export let selected: boolean;
	export let inSelectedWord: boolean;
	export let filler: boolean;
	export let blank: boolean;
	export let value: string;
	export let error: boolean;
	export let ref: any = null;

	let displayValue: string;
	$: displayValue = blank || filler ? ' ' : value;

	function shouldSwallow(e: KeyboardEvent): boolean {
		// allow chords to act normally
		if (e.metaKey || e.altKey || e.ctrlKey) {
			return false;
		}

		// swallow valid puz input
		if (Puzzle.isAlpha(e.key.toUpperCase()) || e.key === 'Tab') {
			return true;
		}

		return false;
	}

	function swallow(e: KeyboardEvent): boolean {
		if (shouldSwallow(e)) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		}
		return true;
	}
</script>

<input
	class:filler
	class:blank
	class:selected
	class:inSelectedWord
	class:error
	on:click
	on:keyup
	on:keydown={swallow}
	bind:this={ref}
	bind:value={displayValue}
>

<style lang="scss">
	input {
		caret-color: transparent;
		aspect-ratio: 1/1;
		min-width: 18px;
		border: 1px solid black;
		display: grid;
		justify-content: center;
		align-content: center;
		text-align: center;
		width: 100%;
		font-size: 1em;
		background-color: white;
		caret-color: transparent;

		&:focus {
			outline: none;
		}

		&:hover:not(.filler) {
			filter: brightness(90%);
		}

		&.filler {
			background-color: black;
		}

		&.error {
			background-color: rgba(255, 0, 0, 0.4);
		}

		&.inSelectedWord {
			background-color: rgba(135, 206, 250, 0.4);
			&.error {
				background-color: rgba(255, 0, 0, 0.6);
			}
			&.selected {
				background-color: rgba(135, 206, 250);
				&.error {
					background-color: rgba(255, 0, 0, 0.7);
				}
			}
		}
	}
</style>
