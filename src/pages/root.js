import { useEffect, useState, useRef } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc, setDoc, deleteDoc, orderBy, arrayRemove } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { Bars } from 'react-loader-spinner'
import useLocalStorage from "use-local-storage";
import { db } from '../config';

function Root() {

    const [data, setData] = useState(null)
    const [email, setEmail] = useLocalStorage("email", "");
    const [password, setPassword] = useLocalStorage("password", "");
    const [newPassword, setNewPassword] = useState('')
    const [verifyCode, setVerifyCode] = useState('')
    const [loadingState, setLoadingState] = useState(false)
    const [uploadArray, setUploadArray] = useState([])
    const [deleteArray, setDeleteArray] = useState([])
    const [nowNewPostNumber, setNowNewPostNumber] = useState('')
    const [usersData, setUsersData] = useState([])
    const navigate = useNavigate()
    let dataCount = useRef(0)

    function getPrompt(newPassword, text) {
        const guest = window.prompt(text, '');
        if (guest != newPassword) {
            return false
        } else {
            return true
        }
    }

    function removeDom(item) {
        document.getElementById('delete-' + item).remove()
    }

    useEffect(() => {
        async function getEmailCheck() {
            if (email == "" || password == "") {
                alert('請先登入')
                navigate('/login')
            }

            const docRef = doc(db, "community", 'basic');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                if (dataCount.current != 0) return
                dataCount.current++
                let communityData = docSnap.data()
                if (communityData.password == password) {
                    setDeleteArray(communityData.deleteList)
                    setUploadArray(communityData.list)
                    setNowNewPostNumber(communityData.post)
                    // get message
                    const querySnapshot = await getDocs(collection(db, "message"), orderBy('time', 'desc'));
                    let dataBuffer = []
                    querySnapshot.forEach((doc) => {
                        dataBuffer = [...dataBuffer, {
                            collectionId: doc.id,
                            img: doc.data().img,
                            id: doc.data().id,
                            reason: doc.data().reason,
                            text: doc.data().text,
                            account: doc.data().account,
                            agree: doc.data().agree,
                            disagree: doc.data().disagree
                        }]
                    });
                    // get user
                    const usersSnapshot = await getDocs(collection(db, "users"), orderBy('state', 'desc'));
                    let usersDataBuffer = []
                    usersSnapshot.forEach((doc) => {
                        usersDataBuffer = [...usersDataBuffer, {
                            email: doc.id,
                            agree: doc.data().agree,
                            disagree: doc.data().disagree,
                            state: doc.data().state
                        }]
                    });
                    setLoadingState(true)
                    setData(dataBuffer);
                    setUsersData(usersDataBuffer)
                } else {
                    alert('密碼錯誤或是已經更換，請重新登入')
                    navigate('/login')
                }
            }
        }
        getEmailCheck()
    }, [])

    return (
        <div className="container mt-5 mb-5">
            <h1 className='mb-5'>管理員專區</h1>
            <p className='border rounded p-3 text-center fs-1 fw-bold bg-light' style={{ width: '5em' }}>#{nowNewPostNumber}</p>
            <div className='border rounded mb-3 p-2' style={{ width: '20em' }}>
                <p className='fs-6 fw-bold m-0'>已決議之刪除文章</p>
                <p className='fs-6 fw-lighter'>若不刪除可能造成帳號封鎖或是群眾反彈</p>
                {
                    deleteArray.map(item => {
                        return (
                            <div className='border m-2 bg-light d-flex justify-content-center align-items-center' id={'delete-' + item} key={item}>
                                <p className='fw-bold m-0 fs-4'>#{item}</p>
                                <button
                                    className='btn btn-sm btn-danger m-2'
                                    onClick={async () => {
                                        const deleteListRef = doc(db, "community", 'basic')
                                        await updateDoc(deleteListRef, {
                                            deleteList: arrayRemove(item)
                                        })
                                        removeDom(item)
                                    }}
                                >已刪除</button>
                            </div>
                        )
                    })
                }
            </div>
            <div className='border rounded mb-3 p-2' style={{ width: '20em' }}>
                <p className='fs-6 fw-bold m-0'>待上傳之文章</p>
                <p className='fs-6 fw-lighter'>若超過設定時間未上傳，請檢查相關設定</p>
                <p className='fw-bold m-0'>目前最新的貼文編號為：#{nowNewPostNumber}</p>
                {
                    uploadArray.map(item => {
                        return (
                            <div className='border m-2 bg-light d-flex justify-content-center'>
                                <p className='fw-bold m-0 fs-4'>#{item}</p>
                            </div>
                        )
                    })
                }
            </div>
            <div className='border rounded mb-3 p-2' style={{ width: '20em' }}>
                <p className='fs-6 fw-bold m-0'>刪除cookie</p>
                <p className='fs-6 fw-lighter'>當遭遇伺服器錯誤時請嘗試按下此鍵</p>
                <button
                    className='btn btn-warning'
                    onClick={async () => {
                        if (getPrompt('sudo reset', '請輸入sudo reset')) {
                            await updateDoc(doc(db, 'community', 'basic'), {
                                session: ''
                            })
                            alert('重設成功')
                        } else {
                            alert('重設失敗')
                        }
                    }}
                >重設</button>
            </div>
            <div className='border rounded mb-3 p-2' style={{ width: '20em' }}>
                <p className='fs-6 fw-bold m-0'>簡訊驗證碼</p>
                <p className='fs-6 fw-lighter'>請在收到簡訊後馬上輸入</p>
                <input
                    type='text'
                    className='form-control mb-2'
                    value={verifyCode}
                    onChange={(e) => {
                        setVerifyCode(e.target.value)
                    }}
                />
                <button
                    className='btn btn-warning'
                    onClick={async () => {
                        if(verifyCode == "") return
                        await updateDoc(doc(db, 'community', 'basic'), {
                            code: verifyCode
                        })
                        setVerifyCode("")
                    }}
                >確認</button>
            </div>
            <div className='border rounded mb-3 p-2' style={{ width: '20em' }}>
                <div>
                    <p className='fs-6 fw-bold m-0'>密碼更改</p>
                    <p className='fs-6 m-1'>新密碼:</p>
                    <input
                        type='password'
                        className='form-control mb-2'
                        value={newPassword}
                        onChange={(e) => {
                            setNewPassword(e.target.value)
                        }}
                    />
                    <button
                        className='btn btn-warning'
                        onClick={async () => {
                            if (newPassword != '') {
                                if (getPrompt(newPassword, '請再輸入一次密碼')) {
                                    const changePassword = doc(db, "community", 'basic')
                                    await updateDoc(changePassword, {
                                        password: newPassword
                                    })
                                    setPassword(newPassword)
                                } else {
                                    alert('密碼不一致，請重新檢查')
                                }
                            } else {
                                alert('請輸入新的密碼')
                            }
                        }}
                    >確認</button>
                </div>
            </div>
            <Link to="/usermanage">
                <button className='btn btn-dark mb-4'>管理審查員</button>
            </Link>
            {!loadingState ? <Bars
                height="80"
                width="80"
                color="#000000"
                ariaLabel="bars-loading"
                wrapperStyle={{}}
                wrapperClass=""
                visible={true}
            /> : ''}
            {(data?.length == 0 && loadingState) ? <div>
                <p className='fw-bold'>目前沒有刪除申請</p>
            </div> : ''}
            {
                <div>
                    {
                        loadingState ? data.map(item => {
                            return (
                                <div className='d-flex flex-wrap gap-2 justify-content-start mb-3 setFlexType'>
                                    <img src={item.img} style={{ height: '10em', width: '10em' }} />
                                    <div className='d-flex flex-column justify-content-between'>
                                        <div className='d-flex flex-column'>
                                            <p className='m-0 fs-6 fw-light' style={{ maxWidth: '30em' }}>{item.text}</p>
                                            <p className='text-dark fw-bold m-0'>{item.reason}</p>
                                            <p className='fw-bold m-0'>{item.agree} : {item.disagree}</p>
                                            {
                                                item.account.map(item => {
                                                    return (
                                                        <p className='m-0'>{item}</p>
                                                    )
                                                })
                                            }
                                        </div>
                                    </div>

                                </div>
                            )
                        }) : ''
                    }
                </div>
            }
        </div>
    )
}

export default Root;
