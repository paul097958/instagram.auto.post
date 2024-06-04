import { useEffect, useState, useRef } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc, orderBy, limit } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { db } from '../config';
import { Bars } from 'react-loader-spinner'

function Temp() {

    let [data, setData] = useState([])
    let [loadingState, setLoadingState] = useState(false)

    useEffect(() => {
        async function getData() {
            const querySnapshot = await getDocs(query(collection(db, "community"), orderBy('time', 'desc'), limit(50)));
            let dataBuffer = []
            querySnapshot.forEach((doc) => {
                if (doc.data().status != false) {
                    dataBuffer = [...dataBuffer, {
                        text: doc.data().text,
                        img: doc.data().img,
                        key: doc.id
                    }]
                }
            });
            setData(dataBuffer)
            setLoadingState(true)
        }
        getData()
    }, [])


    return (
        <div className="container mt-5 mb-5">
            <h1 className='mb-3'>查看所有文章</h1>
            <div className='pt-5'>
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
            <div>
                {
                    loadingState ? (
                        <div>
                            {
                                data.map(item => {
                                    return (
                                        <div className='mt-3' key={item.id}>
                                            <img src={item.img} style={{height: 200}} className='rounded' />
                                            <p className='fw-bold fs-5'>{item.text}</p>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    ) : ''
                }
            </div>
        </div>
    )
}

export default Temp;
