'use client'
import Errorpage from '@/features/marketing/Errorpage'

export default function Error({ error, reset }) {
  return <Errorpage error={error} reset={reset} />
}
