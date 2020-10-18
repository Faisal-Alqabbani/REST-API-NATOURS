import axios from 'axios';
import { showAlert } from './alerts';
export const updateData = async (type, data) => {
  try {
    const url =
      type === 'password'
        ? 'http://localhost:3000/api/v1/users/updateMyPassword'
        : 'http://localhost:3000/api/v1/users/updateMe';
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', `Your ${type.toUpperCase()} updated successfuly`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
// export const updateData = async (name, email) => {
//   try {
//     const res = await axios({
//       method: 'PATCH',
//       url: 'http://localhost:3000/api/v1/users/updateMe',
//       data: {
//         name,
//         email,
//       },
//     });
//     if (res.data.status === 'success') {
//       showAlert('success', 'Your data updated successfuly!');
//     }
//   } catch (err) {
//     showAlert('error', err.response.data.message);
//   }
// };
