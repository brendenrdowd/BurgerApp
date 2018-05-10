import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://react-burger-86673.firebaseio.com/'
})

export default instance;