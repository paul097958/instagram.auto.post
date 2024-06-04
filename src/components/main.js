import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { toTheServer } from '../function/function';
import Loading from 'react-fullscreen-loading';
import html2canvas from 'html2canvas';
import { APP_NAME } from '../config';

function Main() {

  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [fontSize, setFontSize] = useState(35)
  const firstTime = useRef(true)
  const canvasElement = useRef()
  const textContainer = useRef()
  const count = useRef(0)
  const navigate = useNavigate()
  useEffect(() => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    async function adjustFontSizeToFit(container, textElement) {
      const containerHeight = container.clientHeight;
      let fontList = [35, 32, 30, 27, 25, 22, 20, 18, 16, 15, 13, 11, 9]
      while (textElement.scrollHeight > containerHeight - 15) {
        if (count.current < fontList.length - 1) {
          count.current++;
          if (count.current > fontList.length - 1) {
            count.current = fontList.length - 1
          }
        }
        setFontSize(fontList[count.current])
        await sleep(10)

      }
      while (textElement.scrollHeight < parseInt(containerHeight / 2)) {
        if (count.current > 0) {
          count.current--;
          if (count.current < 0) {
            count = 0
          }
        }
        setFontSize(fontList[count.current])
        await sleep(10)
      }

    }
    adjustFontSizeToFit(canvasElement.current, textContainer.current)
  }, [text])




  return (
    <div className='main-container'>
      <div className="container pt-3 d-flex flex-column align-items-center">
        <div className='d-flex gap-3 align-items-center'>
          <p className='fs-1 fw-bold m-0' style={{
            fontFamily: '"Noto Sans TC", sans-serif'
          }}>{APP_NAME}</p>
          <p className='fs-2 m-0'>X</p>
          <img src='./sparka.png' style={{
            height: '4em'
          }} />
        </div>
        <Loading loading={sending} background="rgba(197, 50, 255, 0.566)" loaderColor="#3498db" />
        <div className='gap-1 mb-4 d-flex flex-wrap mt-3'>
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
              fontWeight: 'bold',
              height: 150,
              lineHeight: 1
            }}
            onChange={async (e) => {
              if (!sending) {
                setText(e.target.value)
              }
            }}
          ></textarea>
          <div className='d-flex justify-content-between align-items-center'>
            <div className='d-flex flex-column align-items-start'>
              <p
                className='m-0 fs-5'>送出後不會審核</p>
            </div>
            <button
              className='mt-3 btn btn-light'
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
                  if (serverState) {
                    alert('成功')
                    setSending(prop => !prop)
                    navigate('/hello')
                  } else {
                    alert('上傳失敗')
                    setSending(prop => !prop)
                  }

                }
              }}
            >
              {sending ? '傳送中...請不要關掉頁面' : '送出'}
            </button>
          </div>
        </div>
        <div className={'mt-5 mb-5 p-3 d-flex flex-column justify-content-between align-items-end'} style={{
          height: '20em',
          width: '20em',
          backgroundColor: 'black'
        }} ref={canvasElement}>
          <div className='w-100'>
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
      </div>
    </div>
  );
}

export default Main;
