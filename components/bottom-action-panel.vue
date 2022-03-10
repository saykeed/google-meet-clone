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
          <div class="icon-circle d-flex align-items-center justify-content-center">
            <div>
              <img src="/icons/mic_white_24dp.svg" class="img-fluid" alt="">
            </div>
          </div>
          <div class="icon-circle d-flex align-items-center justify-content-center">
            <div>
              <img src="/icons/videocam_white_24dp.svg" class="img-fluid" alt="">
            </div>
          </div>
          <div @click="hangUp" class="icon-circle end d-flex align-items-center justify-content-center">
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
  props: ['currentRoom', 'remoteStream', 'peerConnection', 'roomId', 'stream', 'currentTime' ],
  computed: {
    currentTime() {
      let now = Date.now()
      return dayjs(now).format('HH:mm')
    },
  },
  methods: {
    async hangUp(e) {
      const ctx = this;
      const tracks = document.querySelector('#localVideo').srcObject.getTracks();
      tracks.forEach(track => {
        track.stop();
      });

      if (ctx.remoteStream) {
        ctx.remoteStream.getTracks().forEach(track => track.stop());
      }

      if (ctx.peerConnection) {
        ctx.peerConnection.close();
      }

      document.querySelector('#localVideo').srcObject = null;
      document.querySelector('#remoteVideo').srcObject = null;
      ctx.$store.commit('room/setCurrentRoomId', null)

      await this.deleteRoom();
    },
    async deleteRoom() {
      const ctx = this;
      if (ctx.roomId) {
        await this.$fire.firestoreReady();
        const roomRef = await this.$fire.firestore.collection('rooms').doc(ctx.roomId)
        const calleeCandidates = roomRef.collection('calleeCandidates').get();
        calleeCandidates.forEach(async candidate => {
          await candidate.ref.delete();
        });
        const callerCandidates = roomRef.collection('callerCandidates').get();
        callerCandidates.forEach(async candidate => {
          await candidate.ref.delete();
        });
        await roomRef.delete();
      }
      await this.$router.push('/')
    }
  }
}
</script>

<style scoped>

</style>
