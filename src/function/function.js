import { collection, addDoc, serverTimestamp, getDoc, updateDoc, doc, arrayUnion, setDoc, increment } from "firebase/firestore";
import { db, IMGUR_TOKEN, SERVER_URL } from '../config';



async function sendLine(message, img) {
    let formdata = new FormData()
    formdata.append('message', message)
    formdata.append('img', img)
    let res = await fetch(SERVER_URL, {
        method: 'POST',
        body: new URLSearchParams(formdata)
    })
    let resData = await res.json()
    let resState = (resData.message == "hello")
    return resState
}
async function deletePost(id, reason, postId, agree = 1, disagree = 0) {
    const basicRef = doc(db, "community", "basic");
    await updateDoc(basicRef, {
        deleteList: arrayUnion(id)
    });
    await addDoc(collection(db, "delete"), {
        result: true,
        agree: agree,
        disagree: disagree,
        id: id,
        reason: reason,
        time: serverTimestamp()
    });
    let resText = await sendLine(`#${id}已刪除`, 'https://i.imgur.com/z3aV8Hi.jpeg')
    return resText
}


async function getMyIP() {
    let res = await fetch('https://api.ipify.org?format=json')
    let data = await res.json()
    return data.ip
}

function isDurationLessThanFiveMinutes(timeStamp, date2) {
    // Ensure date1 is earlier than date2
    if (timeStamp > date2) {
        [timeStamp, date2] = [date2, timeStamp];
    }
    // Calculate the difference in milliseconds
    let differenceInMilliseconds = date2 - timeStamp;
    // Convert milliseconds to minutes
    let millisecondsInMinute = 1000 * 60;
    let differenceInMinutes = differenceInMilliseconds / millisecondsInMinute;
    // Check if the difference is less than 5 minutes
    return differenceInMinutes < 5;
}

function isDurationMoreThanOneMonth(date1, date2) {
    // Ensure date1 is earlier than date2
    if (date1 > date2) {
        [date1, date2] = [date2, date1];
    }

    // Add one month to date1
    let oneMonthLater = new Date(date1);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

    // Compare the modified date with date2
    return date2 > oneMonthLater;
}

async function checkTheIpExistAndInsert(ip) {
    const now = new Date()
    const docRef = doc(db, "ip", ip);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        let data = docSnap.data()
        if (!data.state) {
            if (isDurationMoreThanOneMonth(new Date(data.time.seconds * 1000), now)) {
                await updateDoc(docRef, {
                    count: 1,
                    time: serverTimestamp(),
                    state: true
                });
                return true
            } else {
                return false
            }
        }
        if (isDurationLessThanFiveMinutes(new Date(data.time.seconds * 1000), now)) {
            if (data.count >= 3) {
                await updateDoc(docRef, {
                    state: false
                });
                return false
            } else {
                await updateDoc(docRef, {
                    count: increment(1)
                });
                return true
            }

        } else {
            await updateDoc(docRef, {
                count: 1,
                time: serverTimestamp()
            });
            return true
        }
    } else {
        await setDoc(doc(db, "ip", ip), {
            time: serverTimestamp(),
            count: 1,
            state: true
        });
        return true
    }

}


function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString })
}

async function toTheServer(uri, text) {
    const ip = await getMyIP()
    let uploadStateFromCheck = await checkTheIpExistAndInsert(ip)
    if (!uploadStateFromCheck) {
        alert('你在五分鐘傳超過三則貼文，將封鎖一個月。')
        return false
    }
    // check ip
    const formdata = new FormData()
    formdata.append('type', 'file')
    formdata.append('image', dataURItoBlob(uri))
    let res = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + IMGUR_TOKEN
        },
        body: formdata
    })
    let data = await res.json()
    if (data.success && data.status === 200) {
        const docRef = doc(db, "community", "basic");
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return
        const currenyId = (docSnap.data().post + 1).toString()
        // increment 1 in basic
        await addDoc(collection(db, "community"), {
            img: data.data.link,
            text: '#' + currenyId + ' \n' + text,
            id: currenyId,
            time: serverTimestamp(),
            ip: ip
        });
        // add in community
        const basicRef = doc(db, "community", "basic");
        await updateDoc(basicRef, {
            list: arrayUnion(currenyId),
            post: increment(1)
        });
        // add collection
        return true
    }else{
        return false
    }
}

function countLen(str) {
    return str.replace(/[^\x00-\xff]/g, "xx").length;
}

function getSubstring(str, limit) {
    let count = 0;
    let result = '';

    for (let char of str) {
        count += char.match(/[\u3400-\u9FBF]/) ? 2 : 1;
        if (count > limit) {
            break;
        }
        result += char;
    }
    return result;
}



export { dataURItoBlob, toTheServer, countLen, getSubstring, deletePost, sendLine }