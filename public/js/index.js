/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateData } from './updateSettings';
import { bookTour } from './stripe';
import { getAllUsers, createUser } from './getUsers';
// DOM element
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const btnUsers = document.getElementById('users_here');
const btnAddUser = document.getElementById('add_new_user');

// VALUE

//DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
  console.log('You clicked me');
}

// update User
if (userDataForm)
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('email', document.getElementById('email').value);
    form.append('name', document.getElementById('name').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);
    updateData('Data', form);
    // const email = document.getElementById('email').value;
    // const name = document.getElementById('name').value;
    // updateData('Data', { name, email });
  });

// update Password
if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateData('password', {
      passwordCurrent,
      password,
      passwordConfirm,
    });
    document.querySelector('.btn--save-password').textContent = 'Save Passowrd';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (bookBtn)
  bookBtn.addEventListener('click', (e) => {
    // const tourId = e.target.dataset.tourId same
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });

if (btnUsers)
  btnUsers.addEventListener('click', (e) => {
    e.preventDefault();
    getAllUsers();
  });

if (btnAddUser)
  btnAddUser.addEventListener('click', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name_new_user').value;
    const email = document.getElementById('email_new_user').value;
    const password = document.getElementById('password_new_user').value;
    const passwordConfirm = document.getElementById('passwordC_new_user').value;
    console.log(name, email, password, passwordConfirm);
    await createUser(name, email, password, passwordConfirm);
    document.getElementById('name_new_user').value = '';
    document.getElementById('email_new_user').value = '';
    document.getElementById('password_new_user').value = '';
    document.getElementById('passwordC_new_user').value = '';
  });
