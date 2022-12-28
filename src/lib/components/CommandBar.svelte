<script lang="ts">
	import { openModal } from 'svelte-modals';
	import FaExclamationTriangle from 'svelte-icons/fa/FaExclamationTriangle.svelte';
	import FaCheckDouble from 'svelte-icons/fa/FaCheckDouble.svelte';
	import FaInfo from 'svelte-icons/fa/FaInfo.svelte';
	import Modal from '$lib/components/InfoModal.svelte';

	export let clearPuzzle: () => void;
	export let getInfo: () => { title: string; author: string; copyright: string };
	export let checkPuzzle: () => boolean;

	function handleInfoClick() {
		const info = getInfo();
		openModal(Modal, {
			title: info.title,
			message: `${info.author} (copyright: ${info.copyright})`
		});
	}

	function handleCheckClick() {
		const done = checkPuzzle();
		const title = done ? 'Puzzle solved!' : 'Errors found.';
		openModal(Modal, {
			title: title,
			message: ''
		});
	}
</script>

<div class="command-bar">
	<button on:click={clearPuzzle} title="Clear puzzle" class="dangerous"
		><FaExclamationTriangle /></button
	>
	<button on:click={handleCheckClick} title="Check puzzle"><FaCheckDouble /></button>
	<button on:click={handleInfoClick} title="Puzzle info"><FaInfo /></button>
</div>

<style lang="scss">
	.command-bar {
		display: grid;
		align-items: center;
		justify-content: center;
		grid-template-columns: repeat(3, min-content);
		column-gap: 1em;
		button {
			background-color: transparent;
			border: none;
			width: 2em;
			height: 2em;
			&.dangerous:hover {
				color: red;
			}
			&:hover {
				color: lightskyblue;
			}
		}
	}
</style>
