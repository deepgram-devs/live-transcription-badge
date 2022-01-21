# Deepgram Live Personal Transcription Project

A browser application for live transcription and translation - optimised for small screens. 

## The Project

This project was built January 4-6 2022 by Deepgram's Senior Developer Advocate, Kevin. Tweets showing the progress:

1. [Basic live transcription working](https://twitter.com/_phzn/status/1478504862170161152)
2. [Single and group transcription, badge mode](https://twitter.com/_phzn/status/1478821408486699009)
3. [Added translation](https://twitter.com/_phzn/status/1479186257771220992)

__[Video overview of this project](https://youtu.be/VPdvo6fF0zc)__

## Setup with Glitch

1. Get a [Deepgram Project ID and API Key](https://console.deepgram.com), and a [iTranslate API Key](ttps://itranslate.com/api).
2. Remix this project on Glitch
3. Add your keys in. the `.env` file
4. Update your personal information for badge mode in `public/index.html`
5. Preview in a new window - and that's it! 

## Setup locally

1. Get a [Deepgram Project ID and API Key](https://console.deepgram.com), and a [iTranslate API Key](ttps://itranslate.com/api).
3. Run the following: 

```
git clone https://github.com/deepgram-devs/live-transcription-badge.git
cd live-transcription-badge
npm install
```

Rename `.env.example` to `.env`, popualte with your keys from step 1, and run the project with `npm start`.

## Questions?

- [@DeepgramDevs on Twitter](https://twitter.com/DeepgramDevs)
- [@_phzn on Twitter](https://twitter.com/_phzn)
- [devrel@deepgram.com](mailto:devrel@deepgram.com)