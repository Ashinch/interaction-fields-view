import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import { MicOff, CameraOff, Mic, Camera} from '@geist-ui/react-icons'
import "../util/bee.js"
import { Button, Spacer } from "@geist-ui/react"

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
        {isOneself ? (<div className="status">
          <div className={`control-icon ${cameraOff && "off"}`} onClick={onClickCameraOff}>
            {cameraOff ? (<CameraOff size={18} color="white" />) : (<Camera size={18} color="white" />)}
          </div>
          <Spacer h={.5} />
          <div className={`control-icon ${micOff && "off"}`} onClick={onClickMicOff}>
            {micOff ? (<MicOff size={18} color="white" />) : (<Mic size={18} color="white" />)}
          </div>
        </div>) : (<div className="other-status">
          <div className={`control-icon ${micOff && "off"}`}>
            {micOff ? (<MicOff size={18} color="white" />) : (<Mic size={18} color="white" />)}
          </div>
          <Spacer h={.5} />
          <div className={`control-icon ${cameraOff && "off"}`}>
            {cameraOff ? (<CameraOff size={18} color="white" />) : (<Camera size={18} color="white" />)}
          </div>
        </div>)}
      </div>

      <style jsx="true">{`
        .control-icon {
          border-radius: 100px;
          width: 30px;
          height: 30px;
          background: #0070f3;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
        }

        .off {
          background: red;
        }

        .video {
          height: 289px;
          width: 289px;
          position: relative;
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

export default CameraView
