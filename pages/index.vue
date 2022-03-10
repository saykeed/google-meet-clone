<template>
  <div>
    <div class="transition-overlay" v-if="showTransition">
      <div class="">Joining...</div>
    </div>
    <div class="container pb-5">
      <div class="row align-items-center" style="min-height: 100vh">
        <div class="col-md-6 mt-5 mt-md-0">
          <h1 class="hero font-weight-light gray-200 text-center text-md-left">Premium video meetings. Now free for
            everyone.</h1>
          <p class="font-weight-light gray-100 text-18 text-center text-md-left">We re-engineered the service we built
            for secure business meetings, Google
            Meet,
            to make it free and available for all.</p>
          <div class="d-md-flex">
            <div class="mr-md-2 text-left mb-2">
              <button class="btn fit-content btn-primary" @click="openUserMediaAndCreate">
                <img src="/icons/video_call_white_24dp.svg" class="img-fluid mr-2" alt="">
               New Meeting
              </button>
            </div>
           <div>
             <div class="d-flex align-items-center mb-2">
               <div>
                 <b-input-group class="text-left">
                   <b-input-group-append>
                     <img src="/icons/keyboard_black_24dp.svg" class="img-fluid mr-2" alt="">
                   </b-input-group-append>
                   <b-input v-model="roomId" autocomplete="off" name="code" type="text"
                            placeholder="enter a code or link"></b-input>
                 </b-input-group>
               </div>
               <div v-if="roomId" class="ml-2">
                 <button  class="btn btn-outline-primary" @click.prevent="openUserMediaAndJoin">Join
                 </button>
               </div>
             </div>
             <div class="font-weight-light small">*Note that the peers must be connected to the same network.</div>
           </div>
          </div>
        </div>
        <div class="col-md-6 mt-5 mt-md-0 text-md-right">
          <img class="img-fluid"
               src="/images/meet.svg"
               alt="Get a link you can share" role="img">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IndexPage',
  data() {
    return {
      roomId: '',
      showTransition: false
    }
  },
  computed: {
    configuration() {
      return this.$store.getters['room/configuration'];
    },
    localStream() {
      return this.$store.getters['room/localStream'];
    },
    peerConnection() {
      return this.$store.getters['room/peerConnection'];
    },
    remoteStream() {
      return this.$store.getters['room/remoteStream'];
    },
  },
  methods: {
    async openUserMediaAndCreate(e) {
      const ctx = this;
      ctx.showTransition = true
      const stream = await navigator.mediaDevices.getUserMedia(
        {video: true, audio: true});
      this.$store.commit('room/setStream', stream)

      this.$store.commit('room/setLocalStream', stream);
      this.$store.commit('room/setRemoteStream', new MediaStream());
      await this.createRoom()
    },
    async openUserMediaAndJoin(e) {
      const ctx = this;
      ctx.showTransition = true
      const stream = await navigator.mediaDevices.getUserMedia(
        {video: true, audio: true});
      this.$store.commit('room/setStream', stream)

      this.$store.commit('room/setLocalStream', stream);
      this.$store.commit('room/setRemoteStream', new MediaStream());
      this.$store.commit('room/setCurrentRoomId', this.roomId)
      await this.joinRoomById(ctx.roomId)
    },
    async joinRoomById(roomId) {
      const ctx = this;
      await this.$fire.firestoreReady();
      const roomRef = await this.$fire.firestore.collection('rooms').doc(ctx.roomId)
      const roomSnapshot = await this.$fire.firestore.collection('rooms').doc(`${ctx.roomId}`).get();
      console.log('Got room:', roomSnapshot.exists);

      if (roomSnapshot.exists) {
        const payload = {roomSnapshot, roomRef, localStream: ctx.localStream}
        await this.$store.dispatch('room/joinRoom', payload)
        ctx.showTransition = false
        await this.$router.push('/meet')
      }
    },
    async createRoom() {
      const ctx = this;
      await this.$fire.firestoreReady();
      const roomRef = await this.$fire.firestore.collection('rooms').doc()
      console.log(roomRef)
      console.log('Create ctx.peerConnection with configuration: ', ctx.configuration);
      const payload = {
        roomRef,
        localStream: ctx.localStream
      }
      await this.$store.dispatch('room/createRoom', payload)
      ctx.showTransition = false
      await ctx.$router.push('/meet')
    },

  }
}
</script>
<style>
.btn-primary {
  height: 3em;
  white-space: nowrap;
  outline: 1px solid transparent !important;
  box-shadow: unset;
  width: 165px;
}

.form-control {
  height: 3em;
  white-space: nowrap;
  outline: 1px solid transparent !important;
  box-shadow: unset;
  border: none !important;
  background-color: transparent !important;
}

.btn-outline-primary {
  color: #1b72e8;
  border: none;
}

.input-group {
  border: 1px solid #bfc2c4;
  height: 48px;
  border-radius: 4px;
  padding: 0 16px;
}
.input-group img{
  width: 24px;
}
</style>
