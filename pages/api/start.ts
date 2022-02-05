import spotifyApi from 'lib/spotify'
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'
import { getSession } from 'next-auth/react'

type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { list, range } = req.query
  const session = await getSession({ req })
  const {
    user: { accessToken, refreshToken },
  } = session
  console.log(session)
  spotifyApi.setAccessToken(accessToken)
  spotifyApi.setRefreshToken(refreshToken)

  if (list === 'top') {
    const result = await spotifyApi.getMyTopTracks({ time_range: range as any })
    res.json(
      result.body.items.map(item => ({
        src: item.album.images[0].url,
        album: item.album.name,
        artist: item.artists[0].name,
        name: item.name,
      }))
    )
  }
}
