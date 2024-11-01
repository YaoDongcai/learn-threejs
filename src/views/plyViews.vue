<script setup lang="ts">
import { ref } from 'vue';
import ModelRenderer from './vtkAndThree.vue';

const modelFile = ref<File | null>(null);
const textureFile = ref<File | null>(null);

const handleModelUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    modelFile.value = input.files[0];
  }
};

const handleTextureUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    textureFile.value = input.files[0];
  }
};
</script>

<template>
  <div class="ply-viewer">
    <div class="controls">
      <div class="control-item">
        <label>Model (PLY):</label>
        <input 
          type="file" 
          accept=".ply"
          @change="handleModelUpload"
          class="file-input"
        />
      </div>
      <div class="control-item">
        <label>Texture (PNG):</label>
        <input 
          type="file" 
          accept=".png,.jpg,.jpeg"
          @change="handleTextureUpload"
          class="file-input"
        />
      </div>
    </div>
    <ModelRenderer 
      :model-file="modelFile"
      :texture-file="textureFile"
    />
  </div>
</template>

<style scoped>
.ply-viewer {
  width: 100%;
  height: 100vh;
  position: relative;
}

.controls {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1;
  background: rgba(255, 255, 255, 0.8);
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.control-item {
  margin-bottom: 10px;
}

.control-item:last-child {
  margin-bottom: 0;
}

.control-item label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.file-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}
</style>