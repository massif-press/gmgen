<template>
  <div>
    <div class="text-2xl font-black tracking-widest">{{ title }}</div>
    <div class="text-xl font-bold tracking-widest">
      {{ subtitle }}
    </div>
    <div class="container p-5 m-5 rounded-2xl bg-slate-700">
      <slot name="generator" />
    </div>
    <div class="text-xl font-bold tracking-widest">DATA</div>
    <div class="container p-5 m-5 rounded-2xl bg-slate-700">
      <slot name="data" />
    </div>
    <div class="text-xl font-bold tracking-widest">CODE</div>
    <div class="container p-5 m-5 rounded-2xl bg-slate-700">
      <slot name="code" />
    </div>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    title: String,
    subtitle: String,
  },
};
</script>
