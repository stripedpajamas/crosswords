<script lang="ts">
  export let value: string;
</script>

<div class:filler={value === '.'}>
  <p>{value}</p>
</div>

<style>
  div {
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
</style>