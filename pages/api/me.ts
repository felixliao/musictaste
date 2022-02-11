import spotifyApi from 'lib/spotify'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req })
  if (!session?.user) {
    return res.status(500).send(null)
  }
  const { accessToken } = session.user as any
  spotifyApi.setAccessToken(accessToken)
  const { statusCode, body } = await spotifyApi.getMe()
  if (statusCode === 200) {
    return res.send({ ...body })
  }
  res.status(500).send(null)
}
