import React, { useEffect, useRef } from 'react'
import classNames from 'classnames/bind'

import style from './RecordVideo.scss'
import Popup from 'components/service/record/Popup'
import Button from 'elements/Button.js'
import Stopwatch from 'components/service/record/Stopwatch.js'

const cx = classNames.bind(style)

let mediaRecorder
let recordedBlobs

const RecordVideo = ({
  recordingON,
  setRecordingON,
  recordingOK,
  setRecordingOK,
  setRecordOK,
  popupOK,
}) => {
  const videoRef = useRef()

  const constraints = {
    audio: false,
    video: true,
  }

  const onRecord = () => {
    if (!recordingON) {
      startRecording()
      setRecordingON(true)
      setRecordingOK(false)
    } else {
      stopRecording()
      setRecordingON(false)
      setRecordingOK(true)
    }
  }

  const startRecording = () => {
    recordedBlobs = []
    let options = { mimeType: 'video/webm;codecs=vp9,opus' }
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.error(`${options.mimeType} is not supported`)
      options = { mimeType: 'video/webm;codecs=vp8,opus' }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.error(`${options.mimeType} is not supported`)
        options = { mimeType: 'video/webm' }
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          console.error(`${options.mimeType} is not supported`)
          options = { mimeType: '' }
        }
      }
    }

    try {
      mediaRecorder = new MediaRecorder(window.stream, options)
    } catch (e) {
      console.error('Exception while creating MediaRecorder:', e)
      return
    }

    console.log('Created MediaRecorder', mediaRecorder, 'with options', options)
    mediaRecorder.onstop = (event) => {
      console.log('Recorder stopped: ', event)
      console.log('Recorded Blobs: ', recordedBlobs)
    }
    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedBlobs.push(e.data)
      }
    }
    mediaRecorder.start()
    console.log('MediaRecorder started', mediaRecorder)
  }

  const stopRecording = () => {
    mediaRecorder.stop()
  }

  useEffect(() => {
    ;(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        window.stream = stream
        videoRef.current.srcObject = stream
      } catch (err) {
        console.log(err)
      }
    })()
  })

  return (
    <div className={cx('RecordVideo')}>
      <video ref={videoRef} playsInline autoPlay />
      <Stopwatch recordingON={recordingON} popupOK={popupOK} />
      {recordingON ? (
        <Button onClick={onRecord}>발표 완료하기</Button>
      ) : (
        <Button onClick={onRecord}>발표 시작하기</Button>
      )}
      {recordingOK ? (
        <Popup
          recordedBlobs={recordedBlobs}
          setRecordOK={setRecordOK}
          setRecordingOK={setRecordingOK}
        />
      ) : null}
    </div>
  )
}

export default RecordVideo
