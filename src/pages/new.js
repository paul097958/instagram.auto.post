import { useState, useRef } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { uploadImg, toTheServer } from '../function/function';
import { APP_NAME } from '../config';
import Loading from '../components/Loadding';
import AvatarEditor from 'react-avatar-editor'


function New() {

    const [text, setText] = useState('')
    const [sending, setSending] = useState(false)
    const [imgURL, setImgURL] = useState('')
    const [zoom, setZoom] = useState(1)
    const canvasElement = useRef()
    const inputElement = useRef()
    const [successState, setSuccessState] = useState(null)
    const [loadingData, setLoadingData] = useState({
        currentId: '0000',
        list: [],
        reason: ''
    })
    const firstTime = useRef(true)
    const navigate = useNavigate()
    function previewFile() {
        setImgURL(URL.createObjectURL(inputElement.current.files[0]))
    }

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
                    <Link to="/">
                        <button className='btn btn-dark'>文字模式</button>
                    </Link>
                    <button className='btn btn-light'>圖片模式</button>
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
                        style={{
                            resize: 'none',
                            padding: '15px',
                            fontSize: 25,
                            fontWeight: '500',
                            height: 150,
                            lineHeight: 1
                        }}
                        value={text}
                        onChange={(e) => {
                            if (!sending) {
                                setText(e.target.value)
                            }
                        }}
                        maxLength="457"
                    ></textarea>
                    <div className='d-flex justify-content-between align-items-center'>
                        <div className='d-flex flex-column align-items-start'>
                            <p className='m-0 fs-5'>送出後不會審核</p>
                        </div>
                        <div className='d-flex gap-1'>
                            <label
                                className='btn btn-light mt-3'
                                style={{
                                    backgroundColor: '#E41AC7'
                                }}
                                for="fileTag"
                            >
                                上傳
                            </label>
                            <input
                                className='d-none'
                                type='file'
                                accept="image/*"
                                id='fileTag'
                                ref={inputElement}
                                onChange={async (e) => {
                                    previewFile()
                                }}
                            />
                            <button
                                className='btn btn-light mt-3'
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
                                    if (imgURL == "") {
                                        alert('請先上傳照片')
                                    } else {
                                        setSending(prop => !prop)
                                        let serverState = await toTheServer(canvasElement.current.getImage().toDataURL('image/jpeg'), text)
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
                </div>
                {
                    (imgURL == '') ? (
                        <div className='border bg-light rounded mt-5 mb-5 d-flex justify-content-center align-items-center text-secondary' style={{
                            width: '15em',
                            height: '10em'
                        }}>
                            <p className='m-0'>請先上傳照片</p>
                        </div>
                    ) : <div className='mt-5 mb-5'>
                        <div className='d-flex mb-4 bg-dark text-white p-1 rounded justify-content-start align-items-center gap-1'>
                            <p className='fw-light fs-6 m-0 mx-1'>可裁切照片</p>
                            <button
                                className='btn btn-light btn-sm'
                                onClick={() => {
                                    setZoom(prop => prop + 0.1)
                                }}
                            >放大+</button>
                            <button
                                className='btn btn-light btn-sm'
                                onClick={() => {
                                    setZoom(prop => prop - 0.1)
                                }}
                            >縮小-</button>
                        </div>
                        <AvatarEditor
                            image={imgURL}
                            width={320}
                            height={320}
                            border={20}
                            color={[192, 192, 192, 0.8]} // RGBA
                            scale={zoom}
                            rotate={0}
                            ref={canvasElement}
                            className='bg-dark'
                        />
                    </div>
                }

            </div>
        </div>
    );
}

export default New;
