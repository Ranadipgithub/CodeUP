import { useGoogleLogin } from '@react-oauth/google'
import React from 'react'
import { Button } from './ui/button'

const GoogleLogin = () => {
    // const response = async (authResult) => {

    // }
    // const googlelogin = useGoogleLogin({
    //     onSuccess: 
    // })
  return (
    <div>
      <Button onClick={googlelogin}>Login with Google</Button>
    </div>
  )
}

export default GoogleLogin
