<script lang="ts">
  export let selected: boolean;
  export let filler: boolean;
  export let blank: boolean;
  export let value: string;

  let displayValue: string;
  $: displayValue = blank || filler ? ' ' : value;
</script>

<button class:filler class:blank class:selected on:click on:keyup>
  <p>{displayValue}</p>
</button>

<style>
  button {
    border: 1px solid black;
    display: grid;
    justify-content: center;
    align-content: center;
    text-align: center;
    width: 100%;
    font-size: 24px;
  }

  .filler {
    background-color: black;
  }

  .blank {}

  .selected {
    background-color: lightskyblue;
  }
</style>