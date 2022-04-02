<template>
  <div class="tooltip">
    <button v-if="!link" :class="mode" class="tooltip">
        <slot></slot>
    </button>
    <router-link v-else :to="to" :class="mode" class="tooltip">
        <slot></slot>
    </router-link>
    <span class="tooltiptext">{{ getTipText }}</span>
  </div>
</template>

<script setup>
    import { computed } from 'vue'
    
    const props = defineProps({
        link: {
            type: Boolean,
            required: false,
            default: false
        },
        to: {
            type: String,
            required: false,
            default: '/'
        },
        mode: {
            type: String,
            required: false,
            default: null
        },
        tiptext: String
    })

    const getTipText = computed(() => {
        // console.log(`getTipText => ${props.tiptext}`)
        return props.tiptext
    })

</script>

<style scoped>
button,
a {
  text-decoration: none;
  padding: 0.75rem 1rem;
  font: inherit;
  background-color: #3a0061;
  border: 1px solid #3a0061;
  color: white;
  cursor: pointer;
  border-radius: 10px;
  margin: 0.5rem;
  display: inline-block;
}

a:hover,
a:active,
button:hover,
button:active {
  background-color: #270041;
  border-color: #270041;
}

.flat {
  background-color: transparent;
  color: #3a0061;
  border: none;
}

.outline {
  background-color: transparent;
  border-color: #270041;
  color: #270041;
}

.flat:hover,
.flat:active,
.outline:hover,
.outline:active {
  background-color: #edd2ff;
}

.tooltip {
  position: relative;
  display: inline-block;
}

/* Tooltip text */
.tooltip .tooltiptext {
  visibility: hidden;
  width: 120px;
  background-color: black;
  color: #fff;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;
 
  /* Position the tooltip text - see examples below! */
  /* position: absolute; */
  z-index: 1;
}

/* Show the tooltip text when you mouse over the tooltip container */
.tooltip:hover .tooltiptext {
  visibility: visible;
}

</style>