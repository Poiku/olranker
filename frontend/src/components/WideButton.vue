<template>
  <button
    class="btn-class-name"
    :style="buttonStyles"
  >
    <span class="back"></span>
    <span class="front" style="color: white">{{ props.text }}</span>
  </button>
</template>

<script setup>
import { reactive, computed, watch } from "vue";

// Define props for the button
const props = defineProps({
  text: Number,
  selected: Boolean
});

// Reactive object to store RGB values
const colors = reactive({
  primary: [255, 90, 120], // Example initial values for primary
  secondary: [150, 50, 60] // Example initial values for secondary
});

// Watch the `selected` prop and update `colors` reactively
watch(
  () => props.selected, // Watch for changes to props.selected
  (newSelected) => {
    colors.primary = newSelected ? [144, 238, 144] : [255, 90, 120];
    colors.secondary = newSelected ? [1, 50, 32] : [150, 50, 60];
  },
  { immediate: true } // Run immediately to set the initial values
);

// Computed property for inline styles
const buttonStyles = computed(() => ({
  "--primary": colors.primary.join(", "), // Convert RGB array to string
  "--secondary": colors.secondary.join(", ")
}));
</script>

<style scoped>
.btn-class-name {
  --primary: 255, 90, 120; /* Default values, overridden by inline styles */
  --secondary: 150, 50, 60;
  width: 350px;
  height: 60px;
  border: none;
  outline: none;
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  /* outline: 10px solid rgb(var(--primary), .5); */ /* buggad på ios innan jan 2023 */
  border-radius: 15px; /* Rounded corners */
  position: relative;
  transition: 0.3s;
}

.btn-class-name .back {
  background: rgb(var(--secondary));
  border-radius: 15px; /* Match the parent's rounded corners */
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.btn-class-name .front {
  background: linear-gradient(0deg, rgba(var(--primary), 0.6) 20%, rgba(var(--primary)) 50%);
  box-shadow: 0 0.5em 1em -0.2em rgba(var(--secondary), 0.5);
  border-radius: 15px; /* Match the parent's rounded corners */
  position: absolute;
  border: 1px solid rgb(var(--secondary));
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  font-weight: 600;
  font-family: interblack;
  transform: translateY(-15%);
  transition: 0.15s;
  color: rgb(var(--secondary));
}

.btn-class-name:active .front {
  transform: translateY(0%);
  box-shadow: 0 0;
}
</style>
