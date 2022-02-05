import SpotifyWebApi from 'spotify-web-api-node'
import qs from 'qs'

const scopes = ['user-read-email', 'user-library-read', 'user-top-read']

const LOGIN_URL = `https://accounts.spotify.com/authorize?${qs.stringify({
  scope: scopes.join(' '),
})}`

// credentials are optional
const spotifyApi = new SpotifyWebApi({
  // clientId: process.env.SPOTIFY_CLIENT_ID,
  // clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  // redirectUri: 'http://www.example.com/callback',
})

export default spotifyApi

export { LOGIN_URL }

export async function getList(list: string, range: string, token: string) {
  spotifyApi.setAccessToken(token)

  if (list === 'top') {
    const result = await spotifyApi.getMyTopTracks({
      time_range: range as any,
      limit: 20,
    })
    return result.body.items.map(item => ({
      src: item.album.images[0].url,
      album: item.album.name,
      artist: item.artists[0].name,
      name: item.name,
    }))
  } else {
    const result = await spotifyApi.getMySavedTracks({ limit: 20 })
    return result.body.items.map(item => ({
      src: item.track.album.images[0].url,
      album: item.track.album.name,
      artist: item.track.artists[0].name,
      name: item.track.name,
    }))
  }
}
