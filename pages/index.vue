<template>
  <div>
    <div class="container">
      <div class="row align-items-center" style="min-height: 100vh">
        <div class="col-md-6">
          <h1 class="hero op">Premium video meetings. Now free for everyone.</h1>
          <p class="font-weight-light op">We re-engineered the service we built for secure business meetings, Google
            Meet,
            to make it free and available for all.</p>
          <div class="d-md-flex">
            <div class="mr-2 mb-2">
              <button class="btn btn-primary" @click="openUserMediaAndCreate">New Meeting</button>
            </div>
            <div>
              <b-input v-model="roomId" name="code" type="text" placeholder="enter a code or link"></b-input>
            </div>
            <div class="ml-2">
              <button v-if="roomId" class="btn btn-outline-info" @click.prevent="openUserMediaAndJoin">Join
              </button>
            </div>
          </div>
        </div>
        <div class="col-md-6 text-md-right">
          <img class="img-fluid"
               src="https://www.gstatic.com/meet/user_edu_get_a_link_light_90698cd7b4ca04d3005c962a3756c42d.svg"
               alt="Get a link you can share" role="img" data-atf="true" data-iml="511.3999999910593">
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
      const stream = await navigator.mediaDevices.getUserMedia(
        {video: true, audio: true});
      this.$store.commit('room/setStream', stream)

      this.$store.commit('room/setLocalStream', stream);
      this.$store.commit('room/setRemoteStream', new MediaStream());
      await this.createRoom()
    },
    async openUserMediaAndJoin(e) {
      const ctx = this;
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
      await ctx.$router.push('/meet')
    },

  }
}
</script>
<style>
.op {
  opacity: 8;
}
</style>
