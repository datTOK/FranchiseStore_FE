import { DotLottieReact } from '@lottiefiles/dotlottie-react'

interface LoadingLottieProps {
  fullScreen?: boolean
  size?: number
}

export default function LoadingLottie({
  fullScreen = false,
  size = 440,
}: LoadingLottieProps) {
  const content = (
    <DotLottieReact
      src="https://lottie.host/99afa2d8-2b17-49c7-bde3-b15117465f00/BPDqqO3t59.lottie"
      loop
      autoplay
      style={{ width: size, height: size }}
    />
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        {content}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-8">
      {content}
    </div>
  )
}