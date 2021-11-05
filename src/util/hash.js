import { Model } from "../model/model"

export const getHashCode = (str) => {
  let hash = 1315423911, i, ch
  for (i = str.length - 1; i >= 0; i--) {
    ch = str.charCodeAt(i)
    hash ^= ((hash << 5) + ch + (hash >> 2))
  }
  return (hash & 0x7FFFFFFF)
}

export const getRandomColor = (seed) => {
  return '#D' + (((getHashCode(seed) * 9301 + 49297) % 233280) / 233280.0 * 0xffff00 << 0)
    .toString(16)
    .substr(0, 5)
}

export const getAvatarStyle = (str) => {
  if (str == null) return
  const color = getRandomColor(str)
  return `
          border: unset !important;
          color: white !important;
          background-color: ${color} !important;
      `
}
