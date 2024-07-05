import { useEffect, useState, useRef } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc, arrayUnion, increment, updateDoc, setDoc, deleteDoc, orderBy } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { Bars } from 'react-loader-spinner'
import useLocalStorage from "use-local-storage";
import { deletePost } from '../function/function';
import { db } from '../config';

function Dashboard() {

    const [data, setData] = useState(null)
    const [imData, setImData] = useState(null)
    const [email, setEmail] = useLocalStorage("email", "");
    const [password, setPassword] = useLocalStorage("password", "");
    const [newPassword, setNewPassword] = useState('')
    const [loadingState, setLoadingState] = useState(false)
    const [postNumber, setPostNumber] = useState('')
    const [reason, setReason] = useState('')
    const [postId, setPostId] = useState('')
    let clickState = useRef(true)
    const navigate = useNavigate()
    let dataCount = useRef(0)

    async function change(id, index, method) {
        const messageRef = doc(db, "message", id);
        const docSnap = await getDoc(messageRef);
        const changeUser = doc(db, "users", email)
        let disagreeCount = 0;
        let agreeCount = 0;
        if (method == 'DISAGREE') {
            disagreeCount = 1;
            await updateDoc(messageRef, {
                account: arrayUnion(email),
                disagree: increment(1)
            });
            await updateDoc(changeUser, {
                disagree: increment(1)
            })
        } else if (method == 'AGREE') {
            agreeCount = 1
            await updateDoc(messageRef, {
                account: arrayUnion(email),
                agree: increment(1)
            });
            await updateDoc(changeUser, {
                agree: increment(1)
            })
        }
        if (docSnap.exists()) {
            let messageData = docSnap.data()
            if (messageData.agree + agreeCount >= 3 || messageData.disagree + disagreeCount >= 3) {
                // when the people reach 5
                await deleteDoc(doc(db, "message", id))
                if (messageData.agree + agreeCount >= messageData.disagree + disagreeCount) {
                    let deleteState = await deletePost(messageData.id, messageData.reason, id, messageData.agree + agreeCount, messageData.disagree + disagreeCount)
                    return deleteState
                } else {
                    await setDoc(doc(db, "delete", id), {
                        result: (messageData.agree + agreeCount > messageData.disagree + disagreeCount),
                        agree: messageData.agree + agreeCount,
                        disagree: messageData.disagree + disagreeCount,
                        id: messageData.id,
                        reason: messageData.reason,
                        time: serverTimestamp()
                    });
                    return true
                }
            } else {
                return true
            }
        }
    }

    function removeItem(index) {
        let filteredArray = data.filter(item => item.collectionId !== index)
        setData([...filteredArray])
    }

    function getPrompt() {
        const guest = window.prompt('請再輸入一次密碼', '');
        if (guest != newPassword) {
            return false
        } else {
            return true
        }
    }

    useEffect(() => {
        async function getEmailCheck() {
            if (email == "" || password == "") {
                alert('請先登入')
                navigate('/login')
                return
            }
            const docRef = doc(db, "users", email);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                if (dataCount.current != 0) return
                dataCount.current++
                if (docSnap.data().password == password) {
                    if (!docSnap.data().state) {
                        alert('帳號已經被停權')
                        navigate('/login')
                    } else {
                        const querySnapshot = await getDocs(collection(db, "message"), orderBy('time', 'desc'));
                        let dataBuffer = []
                        querySnapshot.forEach((doc) => {
                            if (!doc.data().account.includes(email)) {
                                dataBuffer = [...dataBuffer, {
                                    collectionId: doc.id,
                                    img: doc.data().img,
                                    id: doc.data().id,
                                    reason: doc.data().reason,
                                    text: doc.data().text,
                                    account: doc.data().account
                                }]
                            }
                        });
                        setLoadingState(true)
                        setData(dataBuffer);

                    }
                } else {
                    alert('密碼錯誤或是已經更換，請重新登入')
                    navigate('/login')
                }
            } else {
                alert('帳號不存在')
                navigate('/login')
            }
        }
        getEmailCheck()
    }, [])

    return (
        <div className="container mt-5 mb-5">
            <h1 className='mb-2'>審查申訴專區</h1>
            <p className='mb-4'>依序為照片預覽，貼文資料，申訴理由</p>
            <div className='border rounded mb-3 p-2' style={{ width: '20em' }}>
                <div>
                    <p className='fs-6 fw-bold m-0'>帳號資訊</p>
                    <p>{email}</p>
                </div>
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
                                if (getPrompt()) {
                                    const changePassword = doc(db, "users", email)
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
            <div className='mb-5'>
                <p className='fs-4 fw-bold'>直接刪除貼文</p>
                <p>當遭遇洗版，色情，暴力，嚴重，寫出名子侮辱人，讓你覺得必須馬上刪除的貼文才能夠使用此功能</p>
                <p className='m-0 fw-bold mb-1'>編號</p>
                <input className='form-control' type='number' placeholder='#' onChange={e => { setPostNumber(e.target.value) }} />
                <p className='m-0 fw-bold mb-1 mt-1'>原因</p>
                <input className='form-control' type='text' placeholder='這將會刊登在頁面' onChange={e => { setReason(e.target.value) }} />
                <div className='mt-2 d-flex gap-2'>
                    <button
                        className='btn btn-success btn-sm'
                        onClick={async () => {
                            setImData(null)
                            const community = collection(db, "community");
                            const q = query(community, where("id", "==", postNumber));
                            const querySnapshot = await getDocs(q);
                            querySnapshot.forEach((doc) => {
                                if (doc.data().status == false) {
                                    alert('貼文已經被檢舉，正在審理或是已經刪除或退回。')
                                    setPostNumber('')
                                } else {
                                    setImData(doc.data());
                                    setPostId(doc.id)
                                }
                            });
                        }}
                    >匯入資料</button>
                    <button
                        className='btn btn-danger btn-sm'
                        onClick={async () => {
                            if (imData == null) {
                                alert('請先匯入資料')
                                return
                            }
                            if (reason == "") {
                                alert('請填寫原因')
                                return
                            }
                            if (clickState.current) {
                                clickState.current = false
                                setLoadingState(false)
                                const postRef = doc(db, "community", postId);
                                await updateDoc(postRef, {
                                    status: false
                                });
                                let checkStatus = await deletePost(imData.id, reason, postId)
                                if (checkStatus) {
                                    setLoadingState(true)
                                    alert('刪除成功')
                                    setImData(null)
                                    setPostId('')
                                    setPostNumber('')
                                    setReason('')
                                    clickState.current = true
                                }
                            }
                        }}
                    >直接刪除貼文</button>
                </div>
                {
                    (imData != null) ? (
                        <div className='mt-2'>
                            <img src={imData.img} style={{ height: '10em' }} />
                            <p className='fs-5 fw-bold'>{imData.text}</p>
                        </div>
                    ) : ''
                }
                <hr />
            </div>
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
                <p className='fw-bold'>目前所有資料都已經審查完畢</p>
            </div> : ''}
            {
                <div>
                    {
                        loadingState ? data.map((item, index) => {
                            return (
                                <div className='d-flex flex-wrap gap-2 justify-content-start mb-3 setFlexType' id={'id-' + item.collectionId}>
                                    <img src={item.img} style={{ height: '10em', width: '10em' }} />
                                    <div className='d-flex flex-column justify-content-between'>
                                        <div className='d-flex flex-column'>
                                            <p className='m-0 mb-3 fs-6 fw-light' style={{ maxWidth: '30em' }}>{item.text}</p>
                                            <p className='text-dark fw-bold'>{item.reason}</p>
                                        </div>
                                        <div className='mt-1'>
                                            <button
                                                className='btn btn-danger'
                                                onClick={async () => {
                                                    setLoadingState(false)
                                                    let changeState = await change(item.collectionId, index, 'AGREE')
                                                    removeItem(item.collectionId)
                                                    if (changeState) {
                                                        setLoadingState(true)
                                                    }
                                                }}
                                            >刪除</button>
                                            <button
                                                className='btn btn-success mx-2'
                                                onClick={async () => {
                                                    setLoadingState(false)
                                                    let changeState = await change(item.collectionId, index, 'DISAGREE')
                                                    removeItem(item.collectionId)
                                                    if (changeState) {
                                                        setLoadingState(true)
                                                    }
                                                }}
                                            >退回</button>
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

export default Dashboard;
