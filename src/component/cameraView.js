import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import { Camera, CameraOff, Mic, MicOff, Volume2, VolumeX } from '@geist-ui/react-icons'
import "../util/bee.js"
import { Card, Select, Slider, Spacer } from "@geist-ui/react"
import { getDevices } from "../model/interact"

const CameraView = forwardRef(({isOneself, onMicChange, onCameraChange, onCameraSwitch}, ref) => {
  const videoRef = useRef()
  const [micOff, setMicOff] = useState(true)
  const [cameraOff, setCameraOff] = useState(false)
  const [cameraDevices, setCameraDevices] = useState([])

  useEffect(() => {
    getDevices((devices) => {
      const cameras = devices.filter((device) => device.kind === "videoinput")
      console.log(cameras)
      setCameraDevices(cameras)
    })
  }, [])

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
    if (!(cameraDevices[0] && cameraDevices[0].deviceId)) return
    setCameraOff(!cameraOff)
    onCameraChange && onCameraChange()
  }

  const onSwitch = (e) => {
    onCameraSwitch && onCameraSwitch(e)
  }

  return (
    <>
      <div className="video">
        <video style={{border: "1px #eaeaea solid", borderRadius: 5, width: 289, height: 289, background: "black"}}
               ref={videoRef} autoPlay muted={isOneself} />
        <Spacer h={1} />
        <Card className="control" height="110px">
          <div className="control-item">
            <div className="flex-items-center pointer" onClick={isOneself && onClickCameraOff}>{isOneself
              ? cameraOff || !(cameraDevices[0] && cameraDevices[0].deviceId) ? <CameraOff color="#aaa" /> : <Camera />
              : cameraOff ? <CameraOff color="#aaa" /> : <Camera />
            }</div>
            <Spacer w={1.2} />
            {isOneself ? (cameraDevices[0]?.deviceId.length ? (
                <Select placeholder="未检测到摄像设备" width="197px"
                        initialValue={cameraDevices[0]?.deviceId}
                        onChange={onSwitch}
                        disableMatchWidth>
                  {cameraDevices.map((item) => {
                    return <Select.Option key={item.deviceId} value={item.deviceId}
                                          selected>{item.label}</Select.Option>
                  })}
                </Select>) : <Select placeholder="未检测到摄像设备" width="197px" disableMatchWidth disabled={true} />
            ) : (
              <></>
            )}
          </div>
          <Spacer w={1} />
          <div className="control-item">
            <div className="flex-items-center pointer" onClick={isOneself && onClickMicOff}>{isOneself
              ? micOff ? <MicOff color="#aaa" /> : <Mic />
              : micOff ? <VolumeX color="#aaa" /> : <Volume2 />
            }</div>
            <Spacer w={1.2} />
            <Slider h={1.2} width="75%" initialValue={100} />
          </div>
        </Card>
      </div>

      <style jsx="true">{`
        .control {
          display: flex;
          align-items: center;
          flex-direction: column;
        }

        .control-item {
          display: flex;
          align-items: center;
        }

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
