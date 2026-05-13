import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { BackgroundColor, ImageAdjustments } from '../types'

export const usePhotoStore = defineStore('photo', () => {
  // State
  const originalImage = ref('')
  const croppedImage = ref('')
  const backgroundRemovedImage = ref('')
  const finalImage = ref('')
  const selectedSize = ref('1寸')
  const backgroundColor = ref<BackgroundColor>('blue')
  const adjustments = ref<ImageAdjustments>({
    brightness: 100,
    contrast: 100,
    saturation: 100
  })
  const isProcessing = ref(false)
  const currentStep = ref(0)

  // Actions
  function setOriginalImage(image: string) {
    originalImage.value = image
  }

  function setCroppedImage(image: string) {
    croppedImage.value = image
  }

  function setBackgroundRemovedImage(image: string) {
    backgroundRemovedImage.value = image
  }

  function setFinalImage(image: string) {
    finalImage.value = image
  }

  function setSelectedSize(size: string) {
    selectedSize.value = size
  }

  function setBackgroundColor(color: BackgroundColor) {
    backgroundColor.value = color
  }

  function setAdjustments(newAdjustments: Partial<ImageAdjustments>) {
    adjustments.value = { ...adjustments.value, ...newAdjustments }
  }

  function resetAdjustments() {
    adjustments.value = {
      brightness: 100,
      contrast: 100,
      saturation: 100
    }
  }

  function setProcessing(processing: boolean) {
    isProcessing.value = processing
  }

  function setCurrentStep(step: number) {
    currentStep.value = step
  }

  function reset() {
    originalImage.value = ''
    croppedImage.value = ''
    backgroundRemovedImage.value = ''
    finalImage.value = ''
    selectedSize.value = '1寸'
    backgroundColor.value = 'blue'
    resetAdjustments()
    currentStep.value = 0
  }

  return {
    // State
    originalImage,
    croppedImage,
    backgroundRemovedImage,
    finalImage,
    selectedSize,
    backgroundColor,
    adjustments,
    isProcessing,
    currentStep,
    // Actions
    setOriginalImage,
    setCroppedImage,
    setBackgroundRemovedImage,
    setFinalImage,
    setSelectedSize,
    setBackgroundColor,
    setAdjustments,
    resetAdjustments,
    setProcessing,
    setCurrentStep,
    reset
  }
})
