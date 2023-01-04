<template>
  <div>
    <DemoLayout
      title="DYNAMIC DEMO"
      subtitle="Art prompt generator defined in code"
    >
      <template #generator>
        <div class="grid grid-cols-3 gap-4">
          <div
            class="justify-self-center w-full py-2 px-4 m-3 rounded-md bg-slate-800"
          >
            <div class="bg-slate-800 ring-2 mb-2 text-center font-bold rounded">
              Subject
            </div>
            <div class="divide-y divide-sky-400/20">
              <div v-for="(o, i) in subject" :key="`object_${i}`">
                <span v-text="o"></span>
                <span
                  v-if="subject.length > 1"
                  class="float-right px-1 font-bold opacity-30 hover:opacity-100 transition-opacity cursor-pointer text-pink-600"
                  @click="remove('subject', i)"
                  >X</span
                >
              </div>
            </div>
            <div class="flex gap-2">
              <div class="flex-grow">
                <input
                  v-model="subjectInput"
                  placeholder="Add an item"
                  class="border-gray-400/25 bg-slate-600 hover:bg-slate-900 focus:bg-slate-900 transition-all w-full h-f p-1 my-2 rounded"
                />
              </div>
              <div class="flex-grow">
                <Btn @click="add('subject')">&nbsp;Add&nbsp;</Btn>
              </div>
            </div>
          </div>

          <div
            class="justify-self-center w-full py-2 px-4 m-3 rounded-md bg-slate-800"
          >
            <div class="bg-slate-800 ring-2 mb-2 text-center font-bold rounded">
              Location
            </div>
            <div v-for="(o, i) in location" :key="`object_${i}`">
              <span v-text="o"></span>
              <span
                v-if="location.length > 1"
                class="float-right px-1 font-bold opacity-30 hover:opacity-100 transition-opacity cursor-pointer text-pink-600"
                @click="remove('location', i)"
                >X</span
              >
            </div>
            <div class="flex gap-2">
              <div class="flex-grow">
                <input
                  v-model="locationInput"
                  placeholder="Add an item"
                  class="border-gray-400/25 bg-slate-600 hover:bg-slate-900 focus:bg-slate-900 transition-all w-full h-f p-1 my-2 rounded"
                />
              </div>
              <div class="flex-grow">
                <Btn @click="add('location')">&nbsp;Add&nbsp;</Btn>
              </div>
            </div>
          </div>

          <div
            class="justify-self-center w-full py-2 px-4 m-3 rounded-md bg-slate-800"
          >
            <div class="bg-slate-800 ring-2 mb-2 text-center font-bold rounded">
              Vibe
            </div>
            <div v-for="(o, i) in vibe" :key="`object_${i}`">
              <span v-text="o"></span>
              <span
                v-if="vibe.length > 1"
                class="float-right px-1 font-bold opacity-30 hover:opacity-100 transition-opacity cursor-pointer text-pink-600"
                @click="remove('vibe', i)"
                >X</span
              >
            </div>
            <div class="flex gap-2">
              <div class="flex-grow">
                <input
                  v-model="vibeInput"
                  placeholder="Add an item"
                  class="border-gray-400/25 bg-slate-600 hover:bg-slate-900 focus:bg-slate-900 transition-all w-full h-f p-1 my-2 rounded"
                />
              </div>
              <div class="flex-grow">
                <Btn @click="add('vibe')">&nbsp;Add&nbsp;</Btn>
              </div>
            </div>
          </div>
        </div>

        <div class="grid">
          <div class="w-96 justify-self-center">
            <Btn @click="generate()">GENERATE PROMPT</Btn>
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
          <b>dynamic_demo.ts</b>
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
import demo from './dynamic_demo';
import codeText from './dynamic_demo.ts?raw';

export default {
  name: 'dynamic-demo',
  components: { Btn, DemoLayout },
  data: () => ({
    output: '<i class="opacity-50">Click the "Generate Prompt" button</i>',
    subjectInput: '',
    subject: ['a bowl of fruit', 'a marble statue', 'an octopus'],
    locationInput: '',
    location: ['a small country home', 'deep space', 'a sun-dappled grove'],
    vibeInput: '',
    vibe: ['mysterious', 'serene', 'ominous'],
    codeStr: codeText,
  }),
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
      this.output = demo({
        subject: this.subject,
        location: this.location,
        vibe: this.vibe,
      });
    },
  },
};
</script>
