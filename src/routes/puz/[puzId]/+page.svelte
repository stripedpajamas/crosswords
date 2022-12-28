<script lang="ts">
	import { Direction, type PuzzleTile } from '$lib/types';
	import { onMount } from 'svelte';
	import { Puzzle } from '$lib/data/puzzle';
	import { Modals, closeModal } from 'svelte-modals';
	import ClueList from '$lib/components/ClueList.svelte';
	import ClueBar from '$lib/components/ClueBar.svelte';
	import Board from '$lib/components/Board.svelte';
	import CommandBar from '$lib/components/CommandBar.svelte';

	export let data;

	let puzzle = new Puzzle(data.puz);
	let clueDirection = Direction.Across;
	let selectedTile = puzzle.getStartOfFirstClue(clueDirection);
	let tileElements: HTMLButtonElement[] = [];

	let currentClue: { clue: string; idx: number } | null;
	$: currentClue = puzzle.getClueForTile(selectedTile, clueDirection);

	onMount(() => {
		// so typing works without clicking anything on first load
		tileElements[selectedTile.idx].focus();
	});

	function selectTile(tile: PuzzleTile): void {
		if (tile.isFiller) {
			tileElements[selectedTile.idx].focus();
			return;
		}
		if (tile.idx === selectedTile.idx) {
			toggleClueDirection();
		}
		if (tile.wordIdxs && tile.wordIdxs[clueDirection].length <= 1) {
			toggleClueDirection();
		}
		selectedTile = tile;
		tileElements[tile.idx].focus();
	}

	function setTileValue(tile: PuzzleTile, value: string): void {
		puzzle.setStateValue(tile.idx, value);
		puzzle = puzzle;
	}

	function toggleClueDirection(): void {
		if (clueDirection === Direction.Across) {
			clueDirection = Direction.Down;
		} else {
			clueDirection = Direction.Across;
		}
	}

	function selectClue(direction: Direction, clueIdx: number): void {
		// If they click a clue that we're already "on", don't try to select it (which would
		// toggle the clue direction).
		if (
			selectedTile.clueIdx &&
			selectedTile.clueIdx[direction] === clueIdx &&
			clueDirection === direction
		) {
			return;
		}
		selectTile(puzzle.getStartingTileForClue(direction, clueIdx));
	}

	function clearPuzzle() {
		puzzle.clearPuzzle();
		puzzle = puzzle;
	}

	function checkPuzzle() {
		return puzzle.checkPuzzle();
	}
</script>

<Modals>
	<div
		slot="backdrop"
		class="backdrop"
		on:click={closeModal}
		on:keydown={(e) => e.key === 'Escape' && closeModal()}
	/>
</Modals>
<main style="--boardSize: {puzzle.width};">
	<ClueBar {currentClue} />
	<CommandBar {clearPuzzle} getInfo={() => puzzle.getInfo()} {checkPuzzle} />
	<Board {puzzle} {clueDirection} {selectedTile} {tileElements} {selectTile} {setTileValue} />
	<ClueList {selectClue} clues={puzzle.clues} {currentClue} {clueDirection} />
</main>

<style lang="scss">
	:global(*) {
		margin: 0;
		padding: 0;
	}
	main {
		display: grid;
		width: 100%;
		grid-template-columns: calc(var(--boardSize) * 50px) 300px;
		grid-template-rows: 50px calc(var(--boardSize) * 50px);
	}

	.backdrop {
		position: fixed;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
		background: rgba(0, 0, 0, 0.5);
	}
</style>
