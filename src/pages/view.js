import { useEffect, useState, useRef } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc, orderBy, limit } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { db } from '../config';
import { Bars } from 'react-loader-spinner'

function ViewPage() {

    let [data, setData] = useState([])
    let [loadingState, setLoadingState] = useState(false)

    useEffect(() => {
        async function getData() {
            const querySnapshot = await getDocs(query(collection(db, "delete"), orderBy('time', 'desc'), limit(30)));
            let dataBuffer = []
            querySnapshot.forEach((doc) => {
                dataBuffer = [...dataBuffer, {
                    result: doc.data().result,
                    agree: doc.data().agree,
                    disagree: doc.data().disagree,
                    id: doc.data().id,
                    reason: doc.data().reason,
                    timestamp: doc.data().time,
                    time: {
                        year: new Date(doc.data().time.seconds * 1000).getFullYear(),
                        month: new Date(doc.data().time.seconds * 1000).getMonth() + 1,
                        date: new Date(doc.data().time.seconds * 1000).getDate(),
                        hour: new Date(doc.data().time.seconds * 1000).getHours(),
                        minute: new Date(doc.data().time.seconds * 1000).getMinutes()
                    }
                }]
            });
            dataBuffer.sort(function (x, y) {
                return x.timestamp - y.timestamp;
            })
            setData(dataBuffer.reverse())
            setLoadingState(true)
        }
        getData()
    }, [])


    return (
        <div className="container mt-5 mb-5">
            <h1 className='mb-3'>查看所有已決議的刪除申請</h1>
            <p>下面顯示分別為</p>
            <ul>
                <li>貼文狀態</li>
                <li>貼文編號</li>
                <li>貼文刪除原因</li>
                <li>審查員投票數(贊成刪除:反對刪除)如果票數為</li>
            </ul>
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
                <div>
                    {
                        data.map((item, index) => {
                            return (
                                <div className='p-2 border rounded d-flex mt-2' key={index}>
                                    <div className='d-flex flex-column justify-content-center align-items-center' style={{ width: '5rem' }}>
                                        <p className='m-0 mx-2 fw-bold fs-6 p-1 rounded m-1 px-2'>#{item.id}</p>
                                        {
                                            item.result ? <p className='text-danger'>已刪除</p> : <p className='text-success'>已退回</p>
                                        }
                                    </div>
                                    <p className='m-0 mx-3 fs-6' style={{ width: '15rem' }}>{item.reason}</p>
                                    <p className='m-0 mx-3 fs-6 fw-bold' style={{minWidth: '3rem'}}>{item.agree} : {item.disagree}</p>
                                    <p>{item.time.year} / {item.time.month} / {item.time.date} {item.time.hour}:{item.time.minute}</p>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
}

export default ViewPage;
