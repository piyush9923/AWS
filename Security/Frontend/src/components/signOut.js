import React from 'react'
import { Auth } from 'aws-amplify';


function SignOut() {
  async function signOut() {
    try {
      await Auth.signOut();
      window.location.reload();
    } catch (error) {
      console.log('error signing out: ', error);
    }
  }

  return (
    <div className='container'>
      <button onClick={signOut}>SignOut</button>
    </div>
  )
}

export default SignOut