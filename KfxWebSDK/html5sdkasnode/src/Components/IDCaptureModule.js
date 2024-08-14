/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState} from "react"
import { convertImageDataToBase64 } from '../kofax/utils'
import { DATA_URL_STRING } from '../constants'
import License from '../license-front.svg'

const IDCaptureModule = ({KfxWebSDK, CaptureAPI, isAutoCaptureSupported, setBase64, front64, back64}) => {

  const [capture, setCapture] = useState(false)

  let currentCameraOptions = {
    containerId: "ID_DIV",
    preference: "gallery",
    useVideoStream: isAutoCaptureSupported,
  }

  const CAPTURESIDE = {
    CAPTURE_FRONT: 'front',
    CAPTURE_BACK: 'back'
  }

  let currentCaptureOptions = {}

  const capturedSide = 'front'

  const standardCapture = (side) => {
    CaptureAPI.performStandardCapture(
      currentCameraOptions,
      function(imageData) {
        const base64 = convertImageDataToBase64(imageData)
        setBase64(side, base64)
        console.log('succes', imageData)
      },
      function(doCaptureError) {
        console.log('error')
      });
  }

  const autoCapture = (side) => {
    currentCaptureOptions = CaptureAPI.mobileIdCaptureOptions;

    if(capturedSide !== CAPTURESIDE.CAPTURE_FRONT) {
        currentCaptureOptions.lookAndFeel.documentSample = "../Images/demo_dl_back.svg";
    } else {
        currentCaptureOptions.lookAndFeel.documentSample = true;
    }
    CaptureAPI.performAdvancedCapture(
      currentCameraOptions,
      currentCaptureOptions,
      function(imageData) {
        console.log('succes', imageData)
        const base64 = convertImageDataToBase64(imageData)
        setBase64(side, base64)
        stopCapture()
      },
      function(doCaptureError) {
        console.log('error')
      }
    );
  }

  const captureID = (side) => {
    if(isAutoCaptureSupported){
      setCapture(true)
      autoCapture(side)
    } else {
      standardCapture(side)
    }
  }

  /* Stop capture if it hasn't already */
  const stopCapture = function() {
    setCapture(false)
    CaptureAPI.stopCapture(function(stopSuccess) {
      CaptureAPI.destroy();
    }, function(error) {
      if (error.code === 0) {
        if (error.message === 'Call stopCapture is not allowed in state STATE_CREATED') {
          CaptureAPI.destroy();
        }
      }
    });
  };

  return (
    <div>
      {!capture && (
        <div>
          <div
            onClick={() => captureID('front64')}
            style={{cursor: 'pointer', margin:'20px 0', width: '100px'}}
          >
            <img src={front64 ? `${DATA_URL_STRING}${front64}` : License} alt="license front" style={{width:'100%', height: 'auto'}}/>
            License Front
          </div>
          <div
            onClick={() => captureID('back64')}
            style={{cursor: 'pointer', margin:'20px 0', width: '100px'}}
          >
            <img src={back64 ? `${DATA_URL_STRING}${back64}` : License} alt="License Back" style={{width:'100%', height: 'auto'}}/>
            License Back
          </div>
        </div>
      )}
      <div
        id="ID_DIV"
        className="ID_CAMERA_DIV"
        style={{
          position: 'fixed',
          top: '0',
          left: '0',
          visibility: capture ? 'visible' : 'hidden',
          width: '100%',
          height: '100%',
          backgroundColor: 'black'
        }}
      />
    </div>
  )
}

export default IDCaptureModule
