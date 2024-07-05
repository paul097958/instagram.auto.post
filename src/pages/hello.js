import { APP_NAME } from "../config";
import { db } from "../config";
import { useEffect, useRef, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

function Hello() {

    let first = useRef(true)
    let [html, setHtml] = useState('')
  
    useEffect(() => {
      if (!first.current) return
      first.current = false;
      (async function () {
        let javascriptRef = doc(db, "community", "basic")
        const docSnap = await getDoc(javascriptRef);
        if (docSnap.exists()) {
          let data = docSnap.data()
          if (data?.rule) {
            setHtml(data.rule)
          }
        }
      })()
    }, [])

    return (
        <div className="container mt-5">
            <h1>{APP_NAME}使用規則：</h1>
            <p className="mt-5 fs-4 text-dark fw-light" dangerouslySetInnerHTML={{__html: html}}>
                
            </p>
        </div>
    );
}

export default Hello;
