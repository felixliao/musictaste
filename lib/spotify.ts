import SpotifyWebApi from 'spotify-web-api-node'
import qs from 'qs'
import { getSession } from 'next-auth/react'

const scopes = ['user-read-email', 'user-library-read', 'user-top-read']

const LOGIN_URL = `https://accounts.spotify.com/authorize?${qs.stringify({
  scope: scopes.join(' '),
  show_dialog: true,
})}`

// credentials are optional
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  // redirectUri: 'http://www.example.com/callback',
})

export default spotifyApi

export { LOGIN_URL }

export async function getList(list: string, range: string, token: string) {
  spotifyApi.setAccessToken(token)

  if (list === 'top') {
    const result = await spotifyApi.getMyTopTracks({ time_range: range as any })
    return result.body.items.map(item => ({
      src: item.album.images[0].url,
      album: item.album.name,
      artist: item.artists[0].name,
      name: item.name,
    }))
  }
}
