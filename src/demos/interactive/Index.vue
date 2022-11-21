<template>
  <div>
    <DemoLayout
      title="INTERACTIVE DEMO"
      subtitle="RPG treasure generator with modifiable templates and selections"
    >
      <template #generator>
        <div class="grid grid-cols-3 gap-4">
          <div
            class="justify-self-center w-full py-2 px-4 m-3 rounded-md bg-slate-800"
          >
            <div class="bg-slate-800 ring-2 mb-2 text-center font-bold rounded">
              Treasure
            </div>
            <div class="divide-y divide-sky-400/20">
              <div v-for="(o, i) in treasure" :key="`object_${i}`">
                <span v-text="o.value"></span>
                <span class="px-3 mr-4 text-cyan-300">({{ o.weight }})</span>
                <span
                  v-if="treasure.length > 1"
                  class="float-right px-1 font-bold opacity-30 hover:opacity-100 transition-opacity cursor-pointer text-pink-600"
                  @click="remove(i)"
                  >X</span
                >
              </div>
            </div>
            <div class="flex gap-1">
              <div class="flex-grow">
                <input
                  v-model="treasureInput"
                  placeholder="Item"
                  class="border-gray-400/25 bg-slate-600 hover:bg-slate-900 focus:bg-slate-900 transition-all h-f p-1 my-2 rounded"
                />
                <input
                  v-model="weightInput"
                  placeholder="Weight"
                  class="border-gray-400/25 bg-slate-600 hover:bg-slate-900 focus:bg-slate-900 transition-all w-16 ml-3 h-f p-1 my-2 rounded"
                />
              </div>
              <div class="flex-grow">
                <Btn @click="add()">&nbsp;Add&nbsp;</Btn>
              </div>
            </div>
          </div>

          <div
            class="justify-self-center w-full py-2 px-4 m-3 rounded-md bg-slate-800 col-span-2"
          >
            <div class="bg-slate-800 ring-2 mb-2 text-center font-bold rounded">
              Template
            </div>
            <textarea
              v-model="template"
              class="border-gray-400/25 bg-slate-600 hover:bg-slate-900 focus:bg-slate-900 transition-all w-full h-f p-1 my-2 rounded"
            />
          </div>
        </div>

        <div class="grid">
          <div class="w-96 justify-self-center">
            <Btn @click="generate">GENERATE LOOT</Btn>
          </div>
          <div
            class="w-1/2 justify-self-center py-2 px-4 m-3 rounded-md bg-slate-800"
          >
            <span v-html="output" />
          </div>
        </div>
      </template>

      <template #code>
        <div>
          <b>interactive_demo.ts</b>
          <div
            class="justify-self-center py-2 px-4 m-3 rounded-md bg-slate-800 font-mono"
          >
            <pre>{{ codeStr }}</pre>
          </div>
        </div>
      </template>

      <template #data>
        <i>This demo does not use any JSON data items</i>
      </template>
    </DemoLayout>
  </div>
</template>

<script lang="ts">
import Btn from '../_components/btn.vue';
import DemoLayout from '../_components/demoLayout.vue';
import demo from './interactive_demo';
import codeText from './interactive_demo.ts?raw';

export default {
  name: 'interactive-demo',
  components: { Btn, DemoLayout },
  data: () => ({
    output: '<i class="opacity-50">Click the "Generate Loot" button</i>',
    treasureInput: '',
    weightInput: 1,
    treasure: [
      { value: 'A small pouch of gold coins', weight: 10 },
      { value: 'A small fungible gem', weight: 4 },
      { value: 'An ornate silver dagger', weight: 1 },
    ],
    template: 'Upon opening the treasure chest, you find...<br>%treasure%',
    codeStr: codeText,
  }),
  methods: {
    add() {
      if (!this.treasureInput || !this.weightInput) return;
      this.treasure.push({
        value: this.treasureInput,
        weight: Number(this.weightInput),
      });
      this.treasureInput = '';
      this.weightInput = 1;
    },
    remove(index: number) {
      this.treasure.splice(index, 1);
    },
    generate() {
      this.output = demo(this.treasure, this.template);
    },
  },
};
</script>
