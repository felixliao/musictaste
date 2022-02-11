import { Song } from 'types'
import qr from 'public/qr.svg'
const download = (url: string): Promise<HTMLImageElement | null> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.src = url
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
  })

export default async function createImage({
  _songList,
  user,
  score,
}: {
  _songList: Song[]
  user?: Record<string, any>
  score: number
}) {
  const [code, avatar, ...songList] = await Promise.all([
    download(qr.src),
    download(user?.images?.[0]?.url),
    ..._songList
      .filter(song => song.score >= 0)
      .map(async song => ({
        ...song,
        image: await download(song.src),
      })),
  ])
  const { max, min } = songList.reduce(
    ({ max, min }, song) => {
      if (song.score > max.score) {
        return { max: song, min }
      }
      if (song.score < min.score) {
        return { max, min: song }
      }
      return { max, min }
    },
    {
      max: songList[0],
      min: songList[0],
    }
  )
  const canvas = document.createElement('canvas')

  canvas.height = 844
  canvas.width = 390
  let ctx = canvas.getContext('2d')
  if (!ctx) {
    return
  }

  for (let x = -5, n = 0; x < 395; x += 100) {
    for (let y = 0; y < 500; y += 100, n++) {
      const image = songList[n]?.image
      image && ctx?.drawImage(image, x, y, 100, 100)
    }
  }

  // mask
  const gradient = ctx.createLinearGradient(0, 844, 0, 100)
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)')
  gradient.addColorStop(0.5, 'rgba(0, 0, 0, 1)')
  gradient.addColorStop(0, 'rgba(0, 0, 0, 1)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 100, 390, 744)

  ctx.font = '30px sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillStyle = '#fff'

  // user
  if (user) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(50, 400, 20, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.clip()

    avatar && ctx?.drawImage(avatar, 30, 380, 40, 40)

    ctx.beginPath()
    ctx.arc(50, 400, 20, 0, Math.PI * 2, true)
    ctx.clip()
    ctx.closePath()
    ctx.restore()

    ctx.fillText(user.display_name, 80, 386, 200)
  }

  // title
  ctx.font = '20px sans-serif'
  ctx.fillText('Netease Music Taste Score', 30, 440)

  // score
  ctx.font = '60px sans-serif'
  ctx.fillStyle = '#18D860'
  ctx.fillText(`${score}`, 30, 470)

  // most song
  ctx.fillStyle = '#555'
  ctx.font = '20px sans-serif'
  ctx.fillText('Song with the most comments: ', 30, 540)

  // most score
  ctx.fillStyle = '#18D860'
  ctx.fillText(`${max.score}`, 310, 540)

  // most cover
  max.image && ctx.drawImage(max.image, 30, 570, 80, 80)

  // most name
  ctx.font = '24px sans-serif'
  ctx.fillStyle = '#fff'
  ctx.fillText(max.name, 120, 585, 160)

  // most artist
  ctx.font = '18px sans-serif'
  ctx.fillStyle = '#888'
  ctx.fillText(max.artist, 120, 620, 200)

  // least song
  ctx.fillStyle = '#555'
  ctx.font = '20px sans-serif'
  ctx.fillText('Song with the least comments: ', 30, 670)

  // least score
  ctx.font = '20px sans-serif'
  ctx.fillStyle = '#18D860'
  ctx.fillText(`${min.score}`, 310, 670, 240)

  // least cover
  min.image && ctx.drawImage(min.image, 30, 700, 80, 80)

  // least name
  ctx.font = '24px sans-serif'
  ctx.fillStyle = '#fff'
  ctx.fillText(min.name, 120, 715, 240)

  // least artist
  ctx.font = '18px sans-serif'
  ctx.fillStyle = '#888'
  ctx.fillText(min.artist, 120, 750, 240)

  // copyright
  ctx.font = '15px sans-serif'
  ctx.fillStyle = '#333'
  ctx.fillText('https://musictaste.vercel.app', 30, 795)
  ctx.font = '14px sans-serif'
  ctx.fillText('Data from Spotify and Netease Music', 30, 810)

  code && ctx.drawImage(code, 305, 765, 60, 60)

  return canvas.toDataURL('image/jpeg')
}
