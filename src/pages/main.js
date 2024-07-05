import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { toTheServer } from '../function/function';
import Loading from '../components/Loadding';
import html2canvas from 'html2canvas';
import { APP_NAME } from '../config';

function Main() {

  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [fontSize, setFontSize] = useState(35)
  const [changeSize, setChangeSize] = useState(0)
  const [autoMode, setAutoMode] = useState(true)
  const [successState, setSuccessState] = useState(null)
  const [loadingData, setLoadingData] = useState({
    currentId: '0000',
    list: [],
    reason: ''
  })
  const firstTime = useRef(true)
  const canvasElement = useRef()
  const textContainer = useRef()
  const fontSizeRef = useRef(35)
  useEffect(() => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    async function adjustFontSizeToFit(container, textElement) {
      const containerHeight = container.clientHeight;
      if (autoMode) {
        while (textElement.scrollHeight > containerHeight - 25) {
          fontSizeRef.current = fontSizeRef.current > 10 ? fontSizeRef.current - 1 : fontSizeRef.current
          setFontSize(prop => (prop > 10) ? prop - 1 : prop)
          await sleep(10)
        }
        while (textElement.scrollHeight < parseInt(containerHeight / 2) && fontSizeRef.current < 35) {
          fontSizeRef.current = fontSizeRef.current < 150 ? fontSizeRef.current + 1 : fontSizeRef.current
          setFontSize(prop => (prop < 150) ? prop + 1 : prop)
          await sleep(10)
        }
      }
    }
    adjustFontSizeToFit(canvasElement.current, textContainer.current)
  }, [text, changeSize, autoMode])




  return (
    <div className='main-container'>
      <div className="container pt-3 d-flex flex-column align-items-center">
        <div className='d-flex gap-2 align-items-center'>
          <p className='fs-1 fw-bold m-0' style={{
            fontFamily: '"Noto Sans TC", sans-serif'
          }}>{APP_NAME}</p>
          <p className='fs-2 m-0'>X</p>
          <img src='./sparka.png' style={{
            height: '4em'
          }} />
        </div>
        <Loading loading={sending} success={successState} data={loadingData} />
        <div className='gap-1 mb-4 d-flex mt-3' style={{
          width: '23.3em'
        }}>
          <button className='btn btn-light'>文字模式</button>
          <Link to="/new">
            <button className='btn btn-dark'>圖片模式</button>
          </Link>
          <Link to="/delete">
            <button className='btn btn-dark'>刪除申請</button>
          </Link>
          <Link to="/login">
            <button className='btn btn-dark'>加入審核</button>
          </Link>
        </div>
        <div className='p-4 d-flex flex-wrap flex-column narrow-container bg-light border'>
          <textarea
            className="form-control"
            aria-label="With textarea"
            placeholder='請在這裡留言...'
            maxLength="457"
            style={{
              resize: 'none',
              padding: '15px',
              fontSize: 25,
              fontWeight: '500',
              height: 150,
              lineHeight: 1
            }}
            onChange={async (e) => {
              if (!sending) {
                setText(e.target.value)
              }
            }}
          ></textarea>
          <div className='d-flex justify-content-between align-items-center mt-3'>
            <div className='d-flex flex-column align-items-start'>
              <div className='bg-dark text-white rounded d-flex align-items-center'>
                <p className='m-0 mx-2'>字體調整</p>
                <button
                  className={'btn btn-sm m-1 btn-' + (autoMode ? 'success' : 'danger')}
                  onClick={() => {
                    setAutoMode(prop => !prop)
                  }}
                >{autoMode ? '自動' : '手動'}</button>
                {
                  !autoMode ? <>
                    <button
                      className='btn btn-secondary btn-sm m-1'
                      onClick={() => {
                        fontSizeRef.current = fontSizeRef.current < 150 ? fontSizeRef.current + 1 : fontSizeRef.current
                        setFontSize(prop => (prop < 150) ? prop + 1 : prop)
                        setChangeSize(prop => prop + 1)
                      }}
                    >+</button>
                    <button
                      className='btn btn-secondary btn-sm m-1'
                      onClick={() => {
                        fontSizeRef.current = fontSizeRef.current > 10 ? fontSizeRef.current - 1 : fontSizeRef.current
                        setFontSize(prop => (prop > 10) ? prop - 1 : prop)
                        setChangeSize(prop => prop + 1)
                      }}
                    >-</button>
                  </> : ''
                }

              </div>
            </div>
            <p className='m-0 fs-5'>{fontSize}px</p>
            <button
              className='btn btn-light'
              style={{
                backgroundColor: '#B15BFF'
              }}
              onClick={async () => {
                if (sending) return
                if (firstTime.current) {
                  firstTime.current = false
                } else {
                  return
                }
                if (text == "") {
                  alert('請輸入一些字')
                } else {
                  let canvas = await html2canvas(canvasElement.current, { scale: 10 })
                  setSending(prop => !prop)
                  let serverState = await toTheServer(canvas.toDataURL("image/jpeg"), text)
                  if (serverState.state) {
                    setSending(prop => !prop)
                    setSuccessState(true)
                    setLoadingData({
                      currentId: serverState.currenyId,
                      list: serverState.list
                    })
                  } else {
                    setSending(prop => !prop)
                    setSuccessState(false)
                    setLoadingData({
                      reason: serverState.reason
                    })
                  }
                }
              }}
            >
              {sending ? '傳送中...' : '送出'}
            </button>
          </div>
        </div>
        <div className={'mt-5 mb-5 p-3 d-flex flex-column justify-content-between align-items-end content-container'} style={{
          height: '20em',
          width: '20em',
          backgroundColor: 'black',
        }} ref={canvasElement}>
          <div className='w-100 h-100' style={{
            overflow: 'hidden',
          }}>
            <p className='text-white m-0 p-0 text-start text-break' style={{
              fontFamily: '"Noto Sans TC", sans-serif',
              whiteSpace: 'pre-wrap',
              lineHeight: 1,
              fontWeight: 500,
              fontSize: fontSize + 'px',
              textSizeAdjust: 'none',
              fontSizeAdjust: 'none',
              WebkitTextSizeAdjust: 'none'
            }} ref={textContainer}>{text}</p>
          </div>
        </div>
        <p className='text-light'>版本號：0.1.1</p>
      </div>
    </div>
  );
}

export default Main;
