<template>
  <div>
    <DemoLayout
      title="WEIGHTED SELECTION DEMO"
      subtitle="Planet generator with configurable weights"
    >
      <template #generator>
        <div class="grid grid-cols-1 gap-4">
          <div
            class="justify-self-center w-full py-2 px-4 m-3 rounded-md bg-slate-800"
          >
            <div class="bg-slate-800 ring-2 mb-2 text-center font-bold rounded">
              Size
            </div>
            <div class="flex gap-4">
              <div>Small</div>
              <input v-model="size" type="range" class="w-full" />
              <div>Large</div>
            </div>
          </div>

          <div
            class="justify-self-center w-full py-2 px-4 m-3 rounded-md bg-slate-800"
          >
            <div class="bg-slate-800 ring-2 mb-2 text-center font-bold rounded">
              Temperature
            </div>
            <div class="flex gap-4">
              <div>Hot</div>
              <input v-model="temp" type="range" class="w-full" />
              <div>Cold</div>
            </div>
          </div>

          <div
            class="justify-self-center w-full py-2 px-4 m-3 rounded-md bg-slate-800"
          >
            <div class="bg-slate-800 ring-2 mb-2 text-center font-bold rounded">
              Atmosphere
            </div>
            <div class="flex gap-4">
              <div>Uninhabitable</div>
              <input v-model="atmos" type="range" class="w-full" />
              <div>Inhabitable</div>
            </div>
          </div>
        </div>

        <div class="grid">
          <div class="w-96 justify-self-center">
            <Btn @click="generate()">GENERATE PROMPT</Btn>
          </div>
          <div
            class="w-1/2 justify-self-center py-2 px-4 mt-3 rounded-md bg-slate-800"
          >
            <span v-html="output" />
          </div>

          <div
            class="w-1/2 justify-self-center text-right italic text-xs opacity-50"
          >
            *extremely unscientific
          </div>
        </div>
      </template>

      <template #code>
        <div>
          <b>dynamic_demo.ts</b>
          <div
            class="justify-self-center py-2 px-4 m-3 rounded-md bg-slate-800 font-mono"
          >
            <pre>{{ codeStr }}</pre>
          </div>
        </div>
      </template>

      <template #data>
        <div v-for="(d, i) in dataItems" :key="i">
          <div>
            <b>{{ d.filename }}</b>
            <div
              class="justify-self-center py-2 px-4 m-3 rounded-md bg-slate-800 font-mono"
            >
              <pre>{{ d.code }}</pre>
            </div>
          </div>
        </div>
      </template>
    </DemoLayout>
  </div>
</template>

<script lang="ts">
import Btn from '../_components/btn.vue';
import DemoLayout from '../_components/demoLayout.vue';
import demo from './weighted_demo';
import codeText from './weighted_demo.ts?raw';
import * as rawData from './data';

export default {
  name: 'weighted-demo',
  components: { Btn, DemoLayout },
  data: () => ({
    size: 50,
    temp: 50,
    atmos: 50,
    output: '<i class="opacity-50">Click the "Generate Prompt" button</i>',
    codeStr: codeText,
    dataItems: [] as { filename: string; code: string }[],
  }),
  created() {
    this.dataItems = Object.keys(rawData).map((d) => ({
      filename: `${d}.json`,
      code: JSON.stringify(rawData[d], null, 2),
    }));
  },
  methods: {
    add(type: string) {
      if (!this[`${type}Input`]) return;
      this[type].push(this[`${type}Input`]);
      this[`${type}Input`] = '';
    },
    remove(type: string, index: number) {
      this[type].splice(index, 1);
    },
    generate() {
      this.output = demo(this.size, this.temp, this.atmos);
    },
  },
};
</script>
