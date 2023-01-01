<script lang="ts">
	export let selected: boolean;
	export let inSelectedWord: boolean;
	export let filler: boolean;
	export let blank: boolean;
	export let value: string;
	export let error: boolean;
	export let ref: any = null;

	let displayValue: string;
	$: displayValue = blank || filler ? ' ' : value;
</script>

<button
	class:filler
	class:blank
	class:selected
	class:inSelectedWord
	class:error
	on:click
	on:keyup
	on:keydown|preventDefault|stopPropagation={e => e.key !== 'Tab'}
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
