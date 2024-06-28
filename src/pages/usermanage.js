import { useEffect, useState, useRef } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc, setDoc, deleteDoc, orderBy, arrayRemove } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Bars } from 'react-loader-spinner'
import useLocalStorage from "use-local-storage";
import { db } from '../config';

function UserManage() {

    const [email, setEmail] = useLocalStorage("email", "");
    const [password, setPassword] = useLocalStorage("password", "");
    const [newPassword, setNewPassword] = useState('')
    const [newUserEmail, setNewUserEmail] = useState('')
    const [loadingState, setLoadingState] = useState(false)
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
                    usersDataBuffer.sort((a, b) => {
                        return (b.agree + b.disagree) - (a.agree + a.disagree);
                    })
                    setLoadingState(true)
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
            <div className='border rounded mb-3 p-2' style={{ width: '20em' }}>
                <div>
                    <p className='fs-6 fw-bold m-0'>新增審查員</p>
                    <p className='fs-6 m-1'>email:</p>
                    <input
                        type='email'
                        className='form-control mb-2'
                        value={newUserEmail}
                        onChange={(e) => {
                            setNewUserEmail(e.target.value)
                        }}
                    />
                    <p>預設密碼為：0000</p>
                    <button
                        className='btn btn-success'
                        onClick={async () => {
                            if (newUserEmail != '') {
                                const addUser = doc(db, "users", newUserEmail)
                                await setDoc(addUser, {
                                    password: '0000',
                                    state: true,
                                    agree: 0,
                                    disagree: 0
                                })
                                setNewUserEmail('')
                            } else {
                                alert('請輸入審查員的email')
                            }
                        }}
                    >確認</button>
                </div>
            </div>
            <div className='mt-5'>
                <p className='fs-3 fw-bold mb-1'>審核員資料</p>
                <p className='fs-5'>總共有{usersData.length}個審查員</p>
            </div>
            <div className='mb-3 d-flex flex-wrap w-100'>
                {
                    usersData.map((item, index) => {
                        return (
                            <div className='d-flex flex-column' style={{ width: '20em' }}>
                                <div className='d-flex flex-column rounded mb-2 p-1'>
                                    <p className='fs-4 m-0 fw-bold'>{item.email}</p>
                                    <p className='m-0'>{item.agree} : {item.disagree}</p>
                                    <p className='m-0 mb-2'>總審理數：{item.agree + item.disagree}</p>
                                    <div className='d-flex gap-1'>
                                        <button
                                            className={'btn btn-' + (item.state ? 'warning' : 'success')}
                                            onClick={async () => {
                                                await updateDoc(doc(db, 'users', item.email), {
                                                    state: !item.state
                                                })
                                                navigate(0)
                                            }}
                                        >{item.state ? '停權' : '復原'}</button>
                                        <button
                                            className='btn btn-danger'
                                            onClick={async () => {
                                                if (getPrompt(item.email, '請輸入' + item.email + '才能刪除帳號')) {
                                                    await deleteDoc(doc(db, 'users', item.email))
                                                } else {
                                                    alert('輸入錯誤，請重試')
                                                }
                                            }}
                                        >刪除帳號</button>
                                        <button
                                            className='btn btn btn-secondary'
                                            onClick={async () => {
                                                await updateDoc(doc(db, 'users', item.email), {
                                                    password: '0000'
                                                })
                                                alert('密碼已重設為0000')
                                            }}
                                        >重設密碼</button>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
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
        </div>
    )
}

export default UserManage;
