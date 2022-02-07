/*eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const signup = async (email, name, password, passwordConfirm) => {
    try {
        const result = await axios.post('/api/v1/users/signup', {
            email,
            name,
            password,
            passwordConfirm
        })
        if(result.data.status === 'success') {
            showAlert('success', 'You successfuly signed up! Please sign in.');
            window.setTimeout(() => {
                location.assign('/');
            }, 1000);
        }
    } catch(err) {
        showAlert('error', err.response.data.message);
    }
};
