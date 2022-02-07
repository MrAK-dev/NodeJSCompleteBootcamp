/*eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
    try{
        const result = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/signin',
            data: {
                email,
                password,
            }
        })
        console.log(result.data.status);
        if(result.data.status === 'success') {
            showAlert('success', 'Logged in successfully');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    }catch(err) {
        showAlert('error', err.response.data.message);
    }
}

export const logout = async () => {
    try{
        const result = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:3000/api/v1/users/signout'
        })
        if(result.data.status = 'success') {
            location.replace('http://127.0.0.1:3000/');
        }
            
    }
    catch(err) {
        console.log(err.response);
        showAlert('error', 'Error logging out! Try again.')
    }
}

