const app = new Vue({
  el: '#app',
  data: {
    languages,
    socket: false,
    mic: {
      mediaRecorder: false,
      stream: false
    },
    settings: {
      mode: 'transcribe',
      translation: false,
      transcription: false
    },
    phrases: {
      final: [],
      pending: [],
      translated: {
        final: [],
        pending: ''
      }
    },
  },
  async created() {
    await this.setModeBasedOnUrlParam()
    await this.getUserMic()
  },
  methods: {
    setModeBasedOnUrlParam() {
      // Sets settings.mode to the value of mode query param
      // If absent, navigates user to ?mode=transcribe
      const url = new URL(location.href)
      const search = new URLSearchParams(url.search)
      this.settings.mode = search.get('mode')
      if(!this.settings.mode) this.navigateTo('transcribe')
    },
    navigateTo(mode) {
      // Reloads page to ?mode=mode
      const url = new URL(location.href)
      const search = new URLSearchParams(url.search)
      search.set('mode', mode)
      const params = search.toString()
      const fullUrl = location.origin + '?' + params
      window.location = fullUrl
    },
    async getUserMic() {
      // Asks for access to user's mic and creates MediaRecorder
      try {
        this.mic.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        if (!MediaRecorder.isTypeSupported('audio/webm')) throw 'Browser not supported'
        this.mic.mediaRecorder = new MediaRecorder(this.mic.stream, { mimeType: 'audio/webm' })
        return this.mic.mediaRecorder
      } catch(err) {
        alert(err)
      }
    },
    async beginTranscription(type = 'single') {
      this.settings.transcription = type
      const { key } = await fetch('/deepgram-token').then(r => r.json())
      
      // Scroll to bottom of page every 100th of a second
      setInterval(() => { window.scrollTo(0, document.body.scrollHeight) }, 10)
      
      // Sets up WebSocket connection to Deepgram
      this.socket = new WebSocket('wss://api.deepgram.com/v1/listen?punctuate=true&diarize=true&interim_results=true', ['token', key])
      
      // Start sending data every 1/4 of a second
      this.socket.onopen = () => {
        this.mic.mediaRecorder.addEventListener('dataavailable', event => {
          if (event.data.size > 0 && this.socket.readyState == 1) this.socket.send(event.data)
        })
        this.mic.mediaRecorder.start(250)
      }
      
      // When data comes back from Deepgram, send to method
      this.socket.onmessage = message => this.transcriptionResults(JSON.parse(message.data))
    },
    transcriptionResults(data) {
      const { is_final, channel } = data
      const { transcript, words } = channel.alternatives[0]
      if(!transcript) return
      
      console.log(data)
      
      // Pull out speaker and word
      this.phrases.pending = words.map(w => {
        const { punctuated_word: word, speaker } = w
        return { word, speaker }
      })
      
      // If we are translating - send this phrase for translation
      if(this.settings.mode == 'translate') this.translatePhrase(this.phrases.pending.map(w => w.word).join(' '), is_final)
      
      // If this is the final version of the phrase, push it into final phrases array
      if(is_final) {
        this.phrases.final.push(...this.phrases.pending)
        this.phrases.pending = []
      }
    },
    beginTranslation(code) {
      // Sets translation setting
      // Starts normal transcription
      // Note: settings.mode is now 'translate' based on URL
      this.settings.translation = code
      this.beginTranscription('single')
    },
    async translatePhrase(text, is_final) {
      const { data } = await axios.post('/translate', { text, lang: this.settings.translation })
      this.phrases.translated.pending = data.text
      if(is_final) {
        this.phrases.translated.final.push(data.text)
        this.phrases.translated.pending = ''
      }
    },
  },
  computed: {
    singleTranscript() {
      const combined = [...this.phrases.final, ...this.phrases.pending]
      const words = combined.filter(w => w.speaker == 0).map(w => w.word)
      return words.join(' ')
    },
    groupTranscript() {
      return [...this.phrases.final, ...this.phrases.pending]
    },
    translatedTranscript() {
      const { final, pending } = this.phrases.translated
      return final.join(' ') + ' ' + pending
    },
    textDirection() {
      const lang = languages.find(l => l.code == this.settings.translation)
      return lang.rtl ? 'rtl' : 'ltr'
    },
  }
})
