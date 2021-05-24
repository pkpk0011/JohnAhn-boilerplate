import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { auth } from '../_actions/user_action';

export default function (SpecificComponent, option, adminRoute = null) {
    
    // option
    // null => 아무나 출입이 가능한페이지
    // true => 로그인한 유저만 출입이 가능한 페이지
    // false => 로그인한 유저는 출입 불가능한 페이지

    // adminRoute
    // null => 관리자가 아니어도 출입가능
    // true => 관리자만 가능
    function AuthenticationCheck(props) {

        const dispatchEvent = useDispatch();

        useEffect(() => {

            dispatchEvent(auth()).then(response => {
                console.log(response)

                // 로그인 하지 않은 상태
                if(!response.payload.isAuth) {
                    // console.log(response) 안에 isAuth의 상태
                    if(option) {
                        props.history.push('/login')
                    }
                } else {
                    // 로그인 한 상태
                    if(adminRoute && !response.payload.isAdmin) {
                        props.history.push('/')
                    } else {
                        if(option === false) {
                            props.history.push('/')
                        }
                    }
                }
            })

        }, [])

    return (
        <SpecificComponent />
    )

}

    return AuthenticationCheck
}