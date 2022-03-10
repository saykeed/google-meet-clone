<template>
  <div class="overlay" v-if="isShowOverlay">
    <div class="position-relative">
      <div @click="closeOverlay" class="position-absolute cursor-pointer close-overlay">
        <img src="/icons/close_black_24dp.svg" class="img-fluid" alt="">
      </div>
    </div>
    <div class="mb-4 text-18 mt-3 font-weight-light">Your meeting's ready</div>
    <p class="font-weight-light text-14">You can share this meeting link with others you want in the meeting</p>
    <div class="overlay-content mb-2 d-flex align-items-center justify-content-between">
      <div>{{ currentRoom }}</div>
      <div @click="copyText" class="cursor-pointer"><img src="/icons/content_copy_black_24dp.svg" class="img-fluid"
                                                         alt=""></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "code-overlay",
  props: {
    isShowOverlay: {
      type: Boolean
    }
  },
  computed: {
    currentRoom() {
      return this.$store.getters['room/currentRoom'];
    },
  },
  methods: {
    closeOverlay() {
      this.$emit('close', false)
    },
    copyText() {
      navigator.clipboard.writeText(this.currentRoom);
      this.$emit('show-snackbar', true)
      this.closeOverlay()
      setTimeout(() => {
        this.$emit('show-snackbar', false)
      }, 4000)
    },
  }
}
</script>

<style scoped>

</style>
