<script lang="ts">
	import { openModal } from 'svelte-modals';
	import FaExclamationTriangle from 'svelte-icons/fa/FaExclamationTriangle.svelte';
	import FaCheckDouble from 'svelte-icons/fa/FaCheckDouble.svelte';
	import FaInfo from 'svelte-icons/fa/FaInfo.svelte';
	import FaHome from 'svelte-icons/fa/FaHome.svelte';
	import Modal from '$lib/components/InfoModal.svelte';

	export let clearPuzzle: () => void;
	export let getInfo: () => { title: string; author: string; copyright: string };
	export let showErrors: () => boolean;

	let showingErrors = false;

	function handleShowErrors() {
		showingErrors = showErrors();
	}

	function handleInfoClick() {
		const info = getInfo();
		openModal(Modal, {
			title: info.title,
			message: `${info.author} (copyright: ${info.copyright})`
		});
	}
</script>

<div class="command-bar">
	<button on:click={clearPuzzle} title="Clear puzzle" class="dangerous"
		><FaExclamationTriangle /></button
	>
	<button on:click={handleShowErrors} title="Show errors" class:showingErrors
		><FaCheckDouble /></button
	>
	<button on:click={handleInfoClick} title="Puzzle info"><FaInfo /></button>
	<a href="/"><button title="Home"><FaHome /></button></a>
</div>

<style lang="scss">
	.command-bar {
		display: grid;
		align-items: center;
		justify-content: center;
		grid-template-columns: repeat(4, min-content);
		column-gap: 1em;

		@media only screen and (max-width: 768px) {
			padding-top: 2em;
		}

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
			&.showingErrors {
				color: green;
				&:hover {
					color: gray;
				}
			}
		}
	}
</style>
