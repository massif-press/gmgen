<template>
  <div class="m-0.5">
    <button
      :class="`bg-cyan-800 hover:bg-cyan-600 duration-300 py-2 rounded-md w-full`"
    >
      <div
        class="sm:text-xs md:text-sm font-semibold text-white ext-white tracking-widest align-middle"
      >
        <slot />
      </div>
    </button>
  </div>
</template>

<script lang="ts">
export default {};
</script>
