# 自動上傳匿名系統

> 版本號：0.1.0 可適用伺服器最舊版本：0.1.0

## 技術支持

本自動匿名系統使用reactjs, firebase所開發，使用GNU條款。

## 部署系統步驟

這裡*不包含*後端部署步驟，步驟中會闡述如和連接

1. 生成TOKEN
1. 初始化firebase資料
1. 配置網站
1. 部署網站

### 生成TOKEN

下面所使用的API都是免費或是有很多免費額度的，不需要綁定信用卡，和支付任何費用

#### IMGUR

> 請直接照著下面的描述做，說得很清楚，絕對看的懂

請先到 <https://imgur.com/> 註冊一個帳號

---

到 <https://api.imgur.com/oauth2/addclient> 這個地方

![imgur oath page](https://i.imgur.com/ACkOyxx.png)

1. Application name：自己取名
1. Authorization type：選第一個
1. Authorization callback URL：<https://www.getpostman.com/oauth2/callback>

其餘都不需要填寫，接著點擊 submit 送出。

---

接下來在瀏覽器輸入下面這個連結

> <p>https://api.imgur.com/oauth2/authorize?client_id=${Client ID}&response_type=token</p>

Client ID就是剛剛上一個頁面取得的。訪問這個頁面時，你就會看到這個頁面，接著按Allow

![oath page](https://i.imgur.com/qUKQwMd.png)

---

接下來頁面顯示什麼不重要，只要複製下來網址就好，網址的形式如下。

> <p>https://www.postman.com/oauth2/callback#access_token=<span style="color: red;">YOUR_TOKEN</span>&expires_in=315360000&token_type=bearer&refresh_token=<span style="color: red;">YOUR_REFRESH_TOKEN</span>&account_username=paul097958&account_id=163392981</p>

只要記好上面我有標註紅色的內容就好，建議記到記事本裡

1. access_token
1. refresh_token

我們程式只需要使用access_token，refresh_token只是讓之後可以重新生成一個新的TOKEN而已，但兩個都還是建議要保存好。

#### Firebase

##### 創建資料庫

接下我們要創建Firebase的資料庫，Firebase是Google的一個產品，所以只要有Google帳號就好了喔。

---

去到Firebase的網站

> 連結：<https://console.firebase.google.com/>

---

按建立專案

![firebase 1](https://i.imgur.com/0iolv98.png)

---

輸入專案名稱，你可以自訂名稱，但只能使用英文

![firebase 2](https://i.imgur.com/QX8coMW.png)

---

接下來就直接按繼續

![firebase 3](https://i.imgur.com/JRDngp4.png)

---

建議把資料庫位置設在離你最近的位置，這樣操作會比較快

![firebase 4](https://i.imgur.com/y8pOgR3.png)

---

等它建立好之後，按網頁的ICON(用箭頭指的地方)

![firebase 5](https://i.imgur.com/xGv5SKD.png)

---

接著輸入應用名稱，也是可以自訂，但一樣只能使用英文，下面那個選項，可以勾也可以不要勾。

![firebase 6](https://i.imgur.com/G0MqNw2.png)

---

接下來你就會得到一個看似很複雜的東西但是不要緊，先把他複製下來，先記到記事本裡面，等一下會用到。記好之後就按前往控制臺。

![firebase 7](https://i.imgur.com/I1ZHnyq.png)

---

到控制台，按下建構裡面的Firebase Database，如下圖

![firebase 8](https://i.imgur.com/x1ld1H5.png)

然後按下建立資料庫

![firebase 9](https://i.imgur.com/nnzBcqS.png)

---

位置一樣選近的，就選asia-east1(台灣)，當然你不在台灣就選你附近的。

![firebase 10](https://i.imgur.com/KGMIKdA.png)

接著按下以正式模式使用，然後就按建立。

![firebase 11](https://i.imgur.com/VNqCi2q.png)

---

你就會到著個頁面

![firebase 12](https://i.imgur.com/yKqJ8O1.png)

然後按上面的規則

![firebase 13](https://i.imgur.com/2hWW9dR.png)

---

在規則裡你會看到這個頁面

![firebase 14](https://i.imgur.com/mIAS4nu.png)

你要把if後面的`false`改成`true`，然後按下發布，圖片如下

![firebase 15](https://i.imgur.com/31Zus4E.png)

改完之後他會有安全性提示，就先不用理它沒有關係，只要不要洩漏剛剛生成的TOKEN就算相對安全。

![firebase 16](https://i.imgur.com/OA2Bolo.png)

---

##### 配置預設資料

按下左邊的新增集合，並且名稱必須是`community`一個字都不能少，接著直接下一步。

![firebase 17](https://i.imgur.com/8zASuC6.png)

接下來文件ID填`basic`，並且按照下面的指示填寫

* `session`：類型`string`，值`留空`
* `password`：類型`string`，值`留空`
* `code`：類型`string`，值`留空`
* `post`：類型`number`，值`0`

上面每一個欄位都要跟下圖長得一樣，否則之後會有問題

![firebase 18](https://i.imgur.com/8rpwBER.png)

按下儲存之後就會長下圖那樣

![firebase 19](https://i.imgur.com/cmsphys.png)

### 生成TOKEN總結

恭喜你配置好了所有東西了，我們來檢查一下。你現在應該記好兩組TOKEN`Imgur`和`Firebase`的。

1. Imgur：`access_token`和`refresh_token`
1. Firebase：一組代碼

### 配置網站

先到本自動匿名系統，下載檔案

> 連結：https://github.com/paul097958/instagram.auto.post

按下綠色的那個`Code`然後按最下面的`Download ZIP`

![github 1](https://i.imgur.com/NKcW10j.png)

下載之後記得<span style="font-size: 30px; font-weight: bold; color: red;">解壓縮</span>我用紅色的代表很重要，因為Windows可以在沒有解壓縮的情況下打開檔案。

---

接下來打開已經解壓縮的資料夾，按進去`src`這個資料夾裡面

![github 2](https://i.imgur.com/dHiQggm.png)

打開之後裡面會有一個叫做`config.js`的檔案

![github 3](https://i.imgur.com/CxMRA7E.png)

接下來打開編輯器，如果沒有特別下載可以打開記事本，接著直接把`config.js`拖移到記事本或是編輯器的視窗裡，之後你會看到下圖的畫面

![github 4](https://i.imgur.com/nPiJmJI.png)

沒有錯這就跟你剛剛Firebase的那段代碼一模一樣，只要把`firebaseConfig`就是第9到17行換成你剛剛申請到的那段代碼，如下圖

![github 5](https://i.imgur.com/6JaCu69.png)

---

接著把你的Imgur的`access_token`填入`IMGUR_TOKEN`裡。和填入你的匿名的名子，例如`ＸＸ匿名`，`黑特ＸＸ`。而那個`SERVER_URL`必須等到完成後端部署之後才能填入，`SERVER_URL`請填伺服器連結+`/send`，請看下面範例。

假如我的伺服器連結為

> <https://helloworld.com>

那就請在`SERVER_URL`填入

> <https://helloworld.com/send>

![github 6](https://i.imgur.com/tf0vRyy.png)

### 部署網站

<span style="font-size: 30px; font-weight: bold; color: red;">請注意：接下來的步驟必須先完成後端的部署，再來操作</span>

### 下載Node js

> 連結：https://nodejs.org/en

![node 1](https://i.imgur.com/TvOFAWC.png)

接下來在命令提示字元或終端機裡面輸入以下指令

```shell
cd /current_directory
npm i
npm run build
```

> 範例教學影片待上傳2024/6/29

接下來執行完命令之後就會生成一個資料夾叫做`build`，接下來只要把這個資料夾上傳至http服務器就好了喔

> 後續待上傳2024/6/29