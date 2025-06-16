'use server'

import { auth, db } from '@/firebase/admin'; // assuming you have db initialized here
import { CollectionReference, DocumentData } from 'firebase-admin/firestore';
import { Trykker } from 'next/font/google';
import { cookies } from 'next/headers';
const ONE_WEEK =60*60*24*7;

// define your params interface
interface SignUpParams {
  uid: string;
  name: string;
  email: string;
}

export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;

  try {
    const userDoc = await db.collection('users').doc(uid).get();

    if (userDoc.exists) {
      return {
        success: false,
        message: 'User already exists. Please sign in instead',
      };
    }

    await db.collection('users').doc(uid).set({
      name,
      email,
    });

    return{
        success:true,
        message:'Account created successfully.Please sign in'
    }

    return {
      success: true,
      message: 'Account created successfully',
    };

  } catch (e: any) {
    console.error('Error creating a user', e);

    // Optional: check for specific Firebase errors
    if (e.code === 'auth/email-already-exists') {
      return {
        success: false,
        message: 'This Email is already in use.',
      };
    }

    return {
      success: false,
      message: 'Failed to create an account',
    };
  }
}

export async function signIn(params: SignInParams){
    const{email,idToken} = params;
    try {
        const userRecord = await auth.getUserByEmail(email);

        if(!userRecord){

            return{ success:false,
            message:'User does not exists.Create an account instead.'
                  }
           
        }
        await setSessionCookie(idToken);
    } catch (e) {
        console.log(e);

        return{
            success:false,
            message:'failed to log into an account'

        }
        
    }
}

export async function setSessionCookie(idToken:string){
    const cookieStore = await cookies();
    const SessionCookie = await auth.createSessionCookie(idToken,{
        expiresIn:ONE_WEEK*1000,

    });
    cookieStore.set('session',SessionCookie,{
        maxAge: ONE_WEEK,
        httpOnly:true,
        secure:process.env.NODE_ENV==='production',
        path: '/',
        sameSite: 'lax',
    });
}

export async function getCurrentUser():Promise<User | null>{
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
     if(!sessionCookie) return null;

     try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie,true);

        const userRecord = await db.
        collection('users')
        .doc(decodedClaims.uid)
        .get();

        if(!userRecord.exists) return null;

        return{
            ...userRecord.data(),
            id:userRecord.id,

        }as User;
     } catch (e) {
        console.log(e)

        return null;
     }
}

export async function isAuthenticated(){
  const user = await getCurrentUser();

  return !!user;
}
