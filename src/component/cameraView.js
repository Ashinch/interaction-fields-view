import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import { Camera, CameraOff, Mic, MicOff, Volume2, VolumeX } from '@geist-ui/react-icons'
import "../util/bee.js"
import { Avatar, Card, Select, Slider, Spacer, Text } from "@geist-ui/react"
import { getDevices } from "../model/interact"
import { Model } from "../model/model"
import User from "@geist-ui/react-icons/user"

const CameraView = forwardRef(({isOneself, isCreator, userJoin, onMicChange, onCameraChange, onCameraSwitch}, ref) => {
  const videoRef = useRef()
  const [micOff, setMicOff] = useState(true)
  const [cameraOff, setCameraOff] = useState(false)
  const [selectValue, setSelectValue] = useState()
  const [cameraDevices, setCameraDevices] = useState([])

  useEffect(() => {
    isOneself && getDevices((devices) => {
      const cameras = devices.filter((device) => device.kind === "videoinput")
      console.log(cameras)
      setCameraDevices(cameras)
      cameras[0]?.deviceId && setSelectValue(cameras[0].deviceId)
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
    if (e === selectValue) return
    setSelectValue(e)
    onCameraSwitch && onCameraSwitch(e)
  }

  return (
    <>
      <div style={{
        display: "flex",
        flexDirection: "column",
      }}>
        <div className={"label " + ((userJoin != null || isOneself) ? "" : "label-not-join")}>
          <Text b style={{
            color: (userJoin != null || isOneself) ? "white" : "#cccccc",
            fontSize: 16
          }}>
            {isCreator ? "面试官" : "候选人"}
          </Text>
          <span>
            {(userJoin != null || isOneself)
              ? <Avatar className={isCreator ? "interviewer" : "candidate"}
                        text={isOneself ? Model.session.getInfo().user.username : userJoin?.username} />
              : <span style={{color: "#cccccc", fontSize: 12}}>未加入</span>
            }

          </span>
        </div>

        {(userJoin != null || isOneself)
          ? <video style={{
            border: "1px solid #eaeaea",
            borderRadius: 5,
            width: 289,
            height: 289,
            background: "#fafafa",
          }} ref={videoRef} autoPlay muted={isOneself} draggable={false}
          />
          : <div style={{
            border: "1px solid #eaeaea",
            borderRadius: 5,
            width: 289,
            height: 289,
            background: "#fafafa",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
          >
            <User size={150} color="#ccc" />
          </div>
        }
        <Spacer h={1.5} />
        <Card className="control" height="110px">
          <div className="control-item">
            <div className="flex-items-center pointer" onClick={isOneself && onClickCameraOff}>{isOneself
              ? cameraOff || !(cameraDevices[0] && cameraDevices[0].deviceId) ? <CameraOff color="#aaa" /> : <Camera />
              : cameraOff || userJoin == null ? <CameraOff color="#aaa" /> : <Camera />
            }</div>
            <Spacer w={1.2} />
            {isOneself ? (cameraDevices[0]?.deviceId && !cameraOff ? (
                <Select placeholder="未检测到摄像设备" width="210px"
                        value={selectValue}
                        onChange={onSwitch}
                        disableMatchWidth>
                  {cameraDevices.map((item) => {
                    return <Select.Option key={item.deviceId} value={item.deviceId}>{item.label}</Select.Option>
                  })}
                </Select>) : <Select placeholder="未检测到摄像设备" width="210px" disableMatchWidth disabled={true} />
            ) : (
              <Select value="" width="210px" disableMatchWidth disabled={true} />
            )}
          </div>
          <Spacer w={1} />
          <div className="control-item">
            <div className="flex-items-center pointer" onClick={isOneself && onClickMicOff}>{isOneself
              ? micOff ? <MicOff color="#aaa" /> : <Mic />
              : micOff || userJoin == null ? <VolumeX color="#aaa" /> : <Volume2 />
            }</div>
            <Spacer w={1.2} />
            <Slider h={1.2} width="75%" initialValue={100}
                    disabled={isOneself ? micOff : userJoin == null || micOff} />
          </div>
        </Card>
      </div>

      <style jsx="true">{`
        .interviewer {
          color: white !important;
          border: 1px solid #7928CA !important;
          background-color: #7928CA !important;
        }

        .candidate {
          color: white !important;
          border: 1px solid #FF4D4D !important;
          background-color: #FF4D4D !important;
        }

        .label {
          height: 50px;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          border-radius: 5px;
          background: black;
          padding: 0 12px;
          margin-bottom: 24px;
        }

        .label-not-join {
          background: #fafafa;
          border: 1px solid #eaeaea;
        }

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
