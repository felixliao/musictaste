export interface Song {
  name: string
  artist: string
  album: string
  src: string
  score?: number | 'notfound' | 'failed'
}