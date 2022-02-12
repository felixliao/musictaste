const Info = () => (
  <div className="flex flex-col px-5 mt-8 gap-3">
    <h1 className="text-6xl">Q&A</h1>
    <h2 className="text-3xl">How does this app work?</h2>
    <p className="text-base">
      This app takes your top/liked songs and cross reference them on Netease
      Music, a Chinese music service that features user comments. The less
      comments your songs have, the less people have liked them, which indicates
      you have a better taste than the general public. This app then calculates
      the average number of comments on your songs (if the song has more than
      1000 comments, it is evaluated as 1000) and translate it into a
      percentage.
    </p>
    <h2 className="text-3xl">Is my information safe?</h2>
    <p className="text-base">
      Yes, this app only requires the information necessary to do the
      calculations, and will never disclose your information to anyone.
    </p>
    <h2 className="text-3xl">Is the source code available?</h2>
    <a className="underline" href="https://github.com/felixliao/musictaste">
      Yes.
    </a>
    <h2 className="text-3xl">I have more questions</h2>
    <a className="underline" href="mailto:liaoxiaofei@bytedance.com">
      Email me
    </a>
  </div>
)

export default Info
