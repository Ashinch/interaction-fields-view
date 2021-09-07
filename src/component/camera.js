import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import { MicOff, CameraOff } from '@geist-ui/react-icons'
import "../util/bee.js"
import { Button, Spacer } from "@geist-ui/react"

const Camera = forwardRef(({isOneself, onMicChange, onCameraChange}, ref) => {
  const videoRef = useRef()
  const [micOff, setMicOff] = useState(false)
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
        <video ref={videoRef} autoPlay muted={isOneself} />
        {isOneself ? (<div className="status">
          <div className={`control-icon ${cameraOff && "off"}`} onClick={onClickCameraOff}>
            <CameraOff size={18} color="white" />
          </div>
          <Spacer h={.5} />
          <div className={`control-icon ${micOff && "off"}`} onClick={onClickMicOff}>
            <MicOff size={18} color="white" />
          </div>
        </div>) : (<div className="other-status">
          <div className={`control-icon ${micOff && "off"}`}>
            <MicOff size={18} color="white" />
          </div>
          <Spacer h={.5} />
          <div className={`control-icon ${cameraOff && "off"}`}>
            <CameraOff size={18} color="white" />
          </div>
        </div>)}
      </div>

      <style jsx="true">{`
        .control-icon {
          border-radius: 100px;
          width: 30px;
          height: 30px;
          background: limegreen;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
        }

        .off {
          background: red;
        }

        .video {
          position: relative;
          background: black;
          width: 300px;
          height: 300px;
        }

        .status {
          position: absolute;
          right: 10px;
          bottom: 20px;
          display: flex;
          flex-direction: column;
        }

        .other-status {
          position: absolute;
          right: 10px;
          top: 10px;
          display: flex;
          flex-direction: column;
        }

        .control {
          display: flex;
          flex-direction: row;
        }
      `}</style>
    </>
  )
})

export default Camera
