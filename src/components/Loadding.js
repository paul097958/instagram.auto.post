import { Bars } from "react-loader-spinner"

function Loading({ loading = false, success = true, data = {
    currentId: '0000',
    list: [],
    reason: ''
} }) {

    function scheduleLastTaskTime(n) {
        let now = new Date();
        now.setHours(now.getUTCHours() + 8);
        let currentMinutes = now.getMinutes();
        let currentHour = now.getHours();
        let startMinute = (currentMinutes % 10 === 0) ? currentMinutes + 10 : Math.ceil(currentMinutes / 10) * 10;
        let totalMinutes = startMinute + (n - 1) * 10;
        let finalHour = currentHour + Math.floor(totalMinutes / 60);
        let finalMinute = totalMinutes % 60;
        if (finalHour >= 24) {
            finalHour %= 24;
        }
        let waitTimeMinutes = totalMinutes - currentMinutes;
        let waitHours = Math.floor(waitTimeMinutes / 60);
        let waitMinutes = waitTimeMinutes % 60;
        let finalTime = `${finalHour}:${finalMinute < 10 ? '0' + finalMinute : finalMinute}`;
        return {
            finalTime,
            waitHours,
            waitMinutes
        }
    }


    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{
            minHeight: '100%',
            width: '100vw',
            position: 'fixed',
            left: '0',
            top: '0',
            backgroundColor: 'rgb(177 91 255 / 87%)'
        }}>
            <div className="d-flex flex-column justify-content-center align-items-center">
                <p className="fw-bold fs-1">傳送中...</p>
                <Bars
                    height="80"
                    width="80"
                    color="#000000"
                    ariaLabel="bars-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                    visible={true}
                />
                <p className="fw-bold mt-5 fs-4">請勿關閉頁面</p>
            </div>
        </div>
    )
    else if (success == true) return (
        <div className="d-flex justify-content-center align-items-center" style={{
            height: '100%',
            width: '100vw',
            position: 'fixed',
            left: '0',
            top: '0',
            backgroundColor: 'rgb(234 212 255 / 87%)'
        }}>
            <div className="d-flex flex-column justify-content-center align-items-center">
                <i className="bi bi-check-circle-fill display-1 text-success"></i>
                <div className="mt-4 p-2 rounded bg-light" style={{
                    width: '15em'
                }}>
                    <p className="m-0">你的貼文編號為:</p>
                    <p className="fs-1 fw-bold m-0">#{data.currentId}</p>
                    <p className="m-0">前面還有<strong className="fs-1"> {data.list.length} </strong> 則匿名等待</p>
                    <p className="m-0">預估上傳時間為</p>
                    <p className="fs-1 fw-bold m-0">{scheduleLastTaskTime(data.list.length + 1).finalTime}</p>
                    <p className="m-0">需等待大約
                        <strong>{scheduleLastTaskTime(data.list.length + 1).waitHours}</strong>小時
                        <strong>{scheduleLastTaskTime(data.list.length + 1).waitMinutes}</strong>分鐘
                    </p>
                </div>
            </div>
        </div>
    )
    else if (success == false) return (
        <div className="d-flex justify-content-center align-items-center" style={{
            height: '100%',
            width: '100vw',
            position: 'fixed',
            left: '0',
            top: '0',
            backgroundColor: 'rgb(234 212 255 / 87%)'
        }}>
            <div className="d-flex flex-column justify-content-center align-items-center">
                <i className="bi bi-exclamation-circle-fill display-1 text-danger"></i>
                <div className="mt-4 p-2 rounded bg-light" style={{
                    width: '15em'
                }}>
                    <p className="fs-5 fw-bold mb-1">錯誤原因：</p>
                    <p>{data.reason}</p>
                </div>
            </div>
        </div>
    )
    else return <></>
}

export default Loading