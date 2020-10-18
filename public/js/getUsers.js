import axios from 'axios';
import { showAlert } from './alerts';

export const getAllUsers = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/v1/users?limit=5');
    console.log(res);
  } catch (error) {
    showAlert('error', error);
  }
};

export const createUser = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'User added successfuly');
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
