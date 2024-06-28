import { APP_NAME } from "../config";

function Hello() {

    return (
        <div className="container mt-5">
            <h1>{APP_NAME}使用規則：</h1>
            <p className="mt-5 fs-4 text-dark fw-light">
                <ul>
                    <li>任何人都不能<code>阻止</code>匿名文的發送</li>
                    <li>沒有任何人知道<code>匿名文</code>的發文者</li>
                    <li>僅有<code>審核員</code>能決定刪除貼文，並且要多數審核員同意</li>
                    <li>任何人都能夠經由測試合格<code>擔任</code>審核員</li>
                </ul>
                <p className="mt-3">
                    有意願擔任審核員者，請到申請頁面填寫基本資料(gmail)，<br />
                    並且填寫審核員測驗，沒有任何其他審核員知到你的身份，<br />
                    除了系統維護者能夠看到gmail<br />
                    2024/5/9
                </p>
            </p>
        </div>
    );
}

export default Hello;
