<template>
  <div class="bar px-4 text-white">
    <div class="row d-flex align-items-center ">
      <div class="col-md-4 d-none d-md-flex align-items-center">
        <div class="pr-2 br-1">
          {{ currentTime }}
        </div>
        <div class="pl-2">
          {{ currentRoom }}
        </div>
      </div>
      <div class="col-md-4">
        <div class="d-flex justify-content-center align-items-center">
          <div @click="$emit('mute')" class="icon-circle d-flex align-items-center justify-content-center">
            <div>
              <img v-if="isNotMuted" src="/icons/mic_white_24dp.svg" class="img-fluid" alt="">
              <img v-else src="/icons/mic_off_white_24dp.svg" class="img-fluid" alt="">
            </div>
          </div>
          <div @click="$emit('toggle')" class="icon-circle d-flex align-items-center justify-content-center">
            <div>
              <img v-if="isVideo" src="/icons/videocam_white_24dp.svg" class="img-fluid" alt="">
              <img v-else src="/icons/videocam_off_white_24dp.svg" class="img-fluid" alt="">
            </div>
          </div>
          <div @click="$emit('end')" class="icon-circle end d-flex align-items-center justify-content-center">
            <div>
              <img src="/icons/call_end_white_24dp.svg" class="img-fluid" alt="">
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4"></div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'

export default {
  name: "bottom-action-panel",
  data() {
    return {
      dayjs
    }
  },
  props: ['remoteStream', 'peerConnection', 'roomId', 'stream',],
  computed: {
    currentTime() {
      let now = Date.now()
      return dayjs(now).format('HH:mm')
    },
    currentRoom() {
      return this.$store.getters['room/currentRoom'];
    },
    isNotMuted() {
      return this.$store.getters['room/isMute'];
    },
    isVideo() {
      return this.$store.getters['room/isVideo'];
    },
  },
  methods: {}
}
</script>

<style scoped>

</style>
