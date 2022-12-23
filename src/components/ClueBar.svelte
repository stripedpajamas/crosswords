<script lang="ts">
  export let currentClue: { clue: string, idx: number };
</script>

<div class="clue-bar">
  <h3>{currentClue.idx + 1}. {currentClue.clue}</h3>
</div>

<style lang="scss">
    .clue-bar {
    display: grid;
    align-items: center;
    justify-items: center;
    grid-column: 1 / 2;
    grid-row: 1 / 2;
    text-align: center;
  }
</style>
