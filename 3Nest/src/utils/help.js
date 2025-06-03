import {jwtDecode} from 'jwt-decode';

export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}


export const decodeToken = (token) => {
    return jwtDecode(token);
}