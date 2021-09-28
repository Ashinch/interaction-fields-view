import { forwardRef, useImperativeHandle, useRef, useState } from "react"
import { Camera, CameraOff, Mic, MicOff, Volume2, VolumeX } from '@geist-ui/react-icons'
import "../util/bee.js"
import { Card, Slider, Spacer } from "@geist-ui/react"

const CameraView = forwardRef(({isOneself, onMicChange, onCameraChange}, ref) => {
  const videoRef = useRef()
  const [micOff, setMicOff] = useState(true)
  const [cameraOff, setCameraOff] = useState(false)

  useImperativeHandle(ref, () => ({
    micOff: micOff,
    cameraOff: cameraOff,
    setStream: (stream) => {
      videoRef.current.srcObject = stream
    },
    setMicOff: (off) => {
      setMicOff(off)
    },
    setCameraOff: (off) => {
      setCameraOff(off)
    },
  }))

  const onClickMicOff = () => {
    setMicOff(!micOff)
    onMicChange && onMicChange()
  }

  const onClickCameraOff = () => {
    setCameraOff(!cameraOff)
    onCameraChange && onCameraChange()
  }

  return (
    <>
      <div className="video">
        <video style={{border: "1px #eaeaea solid", borderRadius: 5, width: 289, height: 289, background: "black"}}
               ref={videoRef} autoPlay muted={isOneself} />
        <Spacer h={1} />
        <Card className="flex-items-center" height="50px">
          <div className="flex-items-center">
            <div className="flex-items-center pointer" onClick={isOneself && onClickCameraOff}>{isOneself
              ? cameraOff ? <CameraOff color="red" /> : <Camera />
              : cameraOff ? <CameraOff color="red" /> : <Camera />
            }</div>
            <Spacer w={1} />
            <div className="flex-items-center pointer" onClick={isOneself && onClickMicOff}>{isOneself
              ? micOff ? <MicOff color="red" /> : <Mic />
              : micOff ? <VolumeX color="red" /> : <Volume2 />
            }</div>
            <Spacer w={1.2} />
            <Slider h={1.2} width="64%" initialValue={100} />
          </div>
        </Card>
      </div>

      <style jsx="true">{`
        .flex-items-center {
          display: flex;
          align-items: center;
        }

        .pointer {
          cursor: pointer;
        }
      `}</style>
    </>
  )
})

export default CameraView
