import type { NextApiRequest, NextApiResponse } from 'next'
import {
  comment_music,
  search,
  song_url,
  song_detail,
} from 'NeteaseCloudMusicApi'

async function searchSong(keyword: string) {
  const res = await search({
    keywords: keyword,
    limit: 5,
    type: 1,
  })
  if (res.status === 200 && res.body.code === 200) {
    const { result } = res.body
    const { songs } = result as any
    if (songs?.length) {
      const song = songs[0]
      return song?.id ?? -1
    }
  }
  return -1
}

async function getCommentCount(id: number): Promise<number> {
  const res = await comment_music({
    id,
    limit: 1,
  })
  if (res.status === 200 && res.body.code === 200) {
    const { total } = res.body
    return (total as number) ?? -1
  }
  return -1
}
type Data = {
  count: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { keyword } = req.query
  if (!keyword) {
    res.status(400).json({ count: -1 })
  }
  const id = await searchSong(keyword as string)
  if (id === -1) {
    res.status(404).json({ count: -1 })
  }
  const count = await getCommentCount(id)
  res.json({
    count,
  })
}
