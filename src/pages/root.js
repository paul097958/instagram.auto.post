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
    const [javascript, setJavascript] = useState('')
    const [rule, setRule] = useState('')
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
                    if (communityData?.script) {
                        setJavascript(communityData?.script);
                    }
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
            <h1>管理員專區</h1>
            <p className='mb-5'>這個頁面是帳號管理員才有權限進入，請切勿把密碼洩漏給他人。</p>
            <div className='d-flex flex-wrap gap-3'>
                <div className='bg-secondary text-white rounded p-2'>
                    <p className='border rounded text-center fs-1 fw-bold bg-light text-dark' style={{ width: '5em' }}>#{nowNewPostNumber}</p>
                    <div className='mb-3 border-bottom' style={{ width: '20em' }}>
                        <p className='fs-3 fw-bold m-0'>待上傳文章</p>
                        <p className='fs-6 fw-light'>若超過設定時間未上傳，請檢查相關設定</p>
                        {uploadArray.length == 0 ? <p className='fw-bold'>目前無待上傳文章</p> : ''}
                        {
                            uploadArray.map(item => {
                                return (
                                    <div className='border mt-1 mb-2 bg-light text-dark rounded d-flex justify-content-center'>
                                        <p className='fw-bold m-0 fs-4'>#{item}</p>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div className='mb-3 border-bottom' style={{ width: '20em' }}>
                        <p className='fs-3 fw-bold m-0'>已決議之刪除文章</p>
                        <p className='fs-6 fw-light'>若不刪除可能造成帳號封鎖或是群眾反彈</p>
                        {deleteArray.length == 0 ? <p className='fw-bold'>目前無待刪除文章</p> : ''}
                        {
                            deleteArray.map(item => {
                                return (
                                    <div className='border rounded mt-1 mb-2 bg-light d-flex justify-content-center align-items-center' id={'delete-' + item} key={item}>
                                        <p className='fw-bold m-0 fs-4 text-dark'>#{item}</p>
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
                </div>
                <div>
                    <div className='mb-3 border-bottom pb-3' style={{ width: '20em' }}>
                        <p className='fs-3 fw-bold m-0'>刪除cookie</p>
                        <p className='fs-6 fw-lighter'>當遭遇伺服器錯誤時請嘗試按下此鍵</p>
                        <button
                            className='btn btn-danger'
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
                    <div className='mb-3 pb-3 border-bottom' style={{ width: '20em' }}>
                        <p className='fs-3 fw-bold m-0'>驗證碼</p>
                        <p className='fs-6 fw-lighter m-0'>請在看到驗證碼之後馬上輸入</p>
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
                                if (verifyCode == "") return
                                await updateDoc(doc(db, 'community', 'basic'), {
                                    code: verifyCode
                                })
                                setVerifyCode("")
                            }}
                        >確認</button>
                    </div>
                    <div className='mb-3 pb-3 border-bottom' style={{ width: '20em' }}>
                        <div>
                            <p className='fs-3 fw-bold m-0'>密碼更改</p>
                            <p className='fs-6 mb-1'>新密碼:</p>
                            <input
                                type='password'
                                className='form-control mb-2'
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value)
                                }}
                            />
                            <button
                                className='btn btn-info'
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
                </div>
                <div>
                    <div style={{ width: '20em' }}>
                        <p className='fs-3 fw-bold'>嵌入頁面Javascript</p>
                        <textarea
                            className='form-control mb-2'
                            type="text"
                            value={javascript}
                            placeholder='write your code here...'
                            style={{
                                resize: 'none',
                                height: '10em'
                            }}
                            onInput={e => {
                                setJavascript(e.target.value)
                            }}
                        />
                        <button
                            className='btn btn-warning'
                            onClick={async () => {
                                const changeJavascript = doc(db, "community", "basic")
                                await updateDoc(changeJavascript, {
                                    script: javascript
                                })
                                alert('儲存成功')
                            }}
                        >儲存</button>
                    </div>
                    <div style={{ width: '20em' }}>
                        <p className='fs-3 fw-bold'>設定使用規則</p>
                        <textarea
                            className='form-control mb-2'
                            type="text"
                            value={rule}
                            placeholder='write your code here...'
                            style={{
                                resize: 'none',
                                height: '10em'
                            }}
                            onInput={e => {
                                setRule(e.target.value)
                            }}
                        />
                        <button
                            className='btn btn-warning'
                            onClick={async () => {
                                const changeJavascript = doc(db, "community", "basic")
                                await updateDoc(changeJavascript, {
                                    rule: rule
                                })
                                alert('儲存成功')
                            }}
                        >儲存</button>
                    </div>
                </div>
                <div>
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
                        <div className='d-flex gap-2 flex-wrap'>
                            {
                                loadingState ? data.map(item => {
                                    return (
                                        <div className="card" style={{ width: '18rem' }}>
                                            <img src={item.img} className="card-img-top" />
                                            <div className="card-body">
                                                <p className="card-title fw-bold">{item.text}</p>
                                                <p className="card-text">{item.reason}</p>
                                                <p className='fw-bold'>{item.agree} : {item.disagree}</p>
                                                {
                                                    item.account.map(item => {
                                                        return (
                                                            <p className='m-0'>{item}</p>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div>
                                    )
                                }) : ''
                            }
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default Root;
