import { useEffect, useState, useRef } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { sendLine } from "../function/function"
import { db } from '../config';

function DeletePage() {

    const [postNumber, setPostNumber] = useState('')
    const [reason, setReason] = useState('')
    const [data, setData] = useState(null)
    const [postId, setPostId] = useState('')
    const firstTime = useRef(true)
    const navigate = useNavigate()
    const now = new Date();
    const utc8Now = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const hour = utc8Now.getUTCHours();
    return (
        <div className="container mt-5 mb-5">
            <div className='mt-4'>
                <h1>內容申訴</h1>
                <p className='mt-4'>請注意，申訴之後不是立刻刪除，會先經由審查員審核通過才予以刪除。而正在審核或是已經決議刪除或退回之貼文則無法再次提出申請。</p>
                <Link to={'/view'}>
                    <button className='btn btn-info'>查看決議文章</button>
                </Link>
            </div>
            <div className='mt-5'>
                <h2 className='fs-4 mb-3'>貼文編號：</h2>
                <input type='number' placeholder='輸入＃後面的數字' className='form-control' value={postNumber} onChange={async (e) => {
                    setPostNumber(e.target.value)
                }} />
                <button
                    className='btn btn-success mt-2'
                    onClick={async () => {
                        setData(null)
                        const community = collection(db, "community");
                        const q = query(community, where("id", "==", postNumber));
                        const querySnapshot = await getDocs(q);
                        querySnapshot.forEach((doc) => {
                            if (doc.data().status == false) {
                                alert('貼文已經被檢舉，正在審理或是已經刪除或退回')
                                setPostNumber('')
                            } else {
                                setPostId(doc.id);
                                setData(doc.data());
                            }
                        });
                    }}
                >匯入貼文</button>
                {
                    data ? <div className='mt-3 d-flex flex-wrap gap-2'>
                        <img src={data.img} style={{ height: '10em' }} />
                        <p className='fs-5 fw-bold'>{data.text}</p>
                    </div> : <></>
                }
                <h2 className='fs-4 mb-3 mt-5'>刪除原因：</h2>
                <input type='text' placeholder='請簡短說明，你的說明可能直接導致結果' className='form-control' onChange={e => setReason(e.target.value)} />
                <button
                    className='btn btn-warning btn-lg mt-4'
                    onClick={async () => {
                        if (firstTime.current) {
                            firstTime.current = false
                        } else {
                            return
                        }
                        if (!data) {
                            alert('請先匯入貼文')
                        } else if (reason == '') {
                            alert('請輸入刪除原因')
                        } else {
                            await addDoc(collection(db, "message"), {
                                id: data.id,
                                text: data.text,
                                img: data.img,
                                reason: reason,
                                time: serverTimestamp(),
                                account: [],
                                agree: 0,
                                disagree: 0
                            });
                            const postRef = doc(db, "community", postId);
                            await updateDoc(postRef, {
                                status: false
                            });
                            let sendState = await sendLine(`\n有新的刪除申請：\nid: ${data.id}\n文字: ${data.text}\n原因: ${reason}`, data.img)
                            if(sendState){
                                alert('申訴成功')
                                setPostId('')
                                setData(null)
                                navigate('/hello')
                            }
                        }
                    }}
                >送出</button>
            </div>
        </div>
    )
}

export default DeletePage;
