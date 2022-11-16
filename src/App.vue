<template>
  <div class="mx-auto container py-2 px-6">
    <div class="text-center text-3xl font-black tracking-widest pb-4">
      gmgen
    </div>
    <div class="md:grid grid-cols-4 grid-rows-1">
      <div class="col-span-1">
        <div class="text-center text-xs tracking-widest text-slate-300">
          RESOURCES
        </div>
        <div class="grid grid-cols-2 grid-rows-2">
          <div><btn @click="$router.push('/')">ABOUT</btn></div>
          <div>
            <btn @click="openTab('https://github.com/massif-press/gmgen/wiki')"
              >DOCS</btn
            >
          </div>
          <div>
            <btn @click="openTab('https://beeftime.itch.io/gm-gen')">GUIDE</btn>
          </div>
          <div>
            <btn @click="openTab('https://github.com/massif-press/gmgen')"
              >REPO</btn
            >
          </div>
        </div>
      </div>
      <div class="col-span-3 md:pl-6">
        <div class="text-center text-xs tracking-widest text-slate-300">
          DEMOS
        </div>
        <div class="md:grid grid-cols-3 grid-rows-2">
          <div><btn short @click="$router.push('/basic')">BASIC</btn></div>
          <div>
            <btn short @click="$router.push('/advanced')">ADVANCED</btn>
          </div>
          <div><btn short @click="$router.push('/dynamic')">DYNAMIC</btn></div>
          <div>
            <btn short @click="$router.push('/weighted')">CONFIGURABLE</btn>
          </div>
          <div>
            <btn short @click="$router.push('/interactive')">INTERACTIVE</btn>
          </div>
          <div>
            <btn short @click="$router.push('/more')">MORE EXAMPLES</btn>
          </div>
        </div>
      </div>
    </div>

    <hr class="my-3" />

    <router-view />
  </div>
</template>

<script setup lang="ts">
import Btn from './demos/_components/btn.vue';

const openTab = (url: string) => {
  window.open(url, '_blank');
};
</script>
