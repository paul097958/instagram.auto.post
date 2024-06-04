import useLocalStorage from "use-local-storage";
import { useNavigate } from "react-router-dom";

function Login() {

    const navigate = useNavigate()
    const [email, setEmail] = useLocalStorage("email", "");
    const [password, setPassword] = useLocalStorage("password", "");

    return (
        <div className='d-flex justify-content-center mt-5 mb-5'>
            <div className="narrow-container">
                <h1>審查員登入</h1>
                <p className='mt-3'>如果還沒有帳號的，請聯絡帳號擁有者</p>
                <div className='mt-5'>
                    <h2 className='fs-3'>帳號：</h2>
                    <input
                        type='email'
                        placeholder='email'
                        className='form-control'
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                        }} />
                    <h2 className='mt-4 fs-3'>密碼：</h2>
                    <input
                        type='password'
                        placeholder='password'
                        className='form-control'
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                        }}
                    />
                    <button
                        className='btn btn-lg btn-warning mt-4'
                        onClick={() => {
                            if (email == "" || password == "") {
                                alert('請輸入帳號和密碼')
                            }
                            if (email.trimEnd() == 'root') {
                                navigate('/root')
                                return
                            }else{
                                navigate('/dashboard')
                            }
                            
                        }}
                    >確認</button>
                </div>
            </div>
        </div>
    );
}

export default Login;
