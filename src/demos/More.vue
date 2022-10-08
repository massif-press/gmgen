<template>
  <div class="text-2xl font-black tracking-widest">
    OTHER GMGEN-POWERED GENERATORS
  </div>

  <div class="container p-3 m-5 rounded-md bg-slate-700">
    <div v-for="i in items" class="flex bg-slate-800 p-1 m-1 rounded-sm">
      <div class="w-1/5 bg-slate-800 p-1 text-center">
        <a
          :href="i.url"
          target="_blank"
          class="text-cyan-600 hover:text-cyan-200 duration-300 px-1"
          >{{ i.title }}</a
        >
      </div>
      <div class="w-4/5 bg-slate-800 p-1">
        {{ i.desc }}
        <span class="float-right"
          ><a
            :href="i.author_url"
            target="_blank"
            class="text-cyan-600 hover:text-cyan-200 duration-300 px-1"
            >{{ i.author }}</a
          ></span
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const items = [
  {
    title: 'cc-chargen',
    url: '',
    desc: 'A general LANCER-related thing generator',
    author: '@beef',
    author_url: 'https://www.patreon.com/compcon',
  },
];
</script>
