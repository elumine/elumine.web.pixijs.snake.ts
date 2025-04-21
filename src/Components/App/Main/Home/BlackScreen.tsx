import { useEffect, useState } from "react"


export const BlackScreen = ({visible}: {visible: boolean}) => {

    useEffect(() => {
        //
    });

    return <>
        <div className={`black-screen ${visible ? 'visible' : 'hidden'}`}></div>
    </>
}