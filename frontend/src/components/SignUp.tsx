import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { DisplayErrors } from './DisplayErrors';
import Alert from 'react-bootstrap/Alert';
import { ReactNotifications, Store } from 'react-notifications-component';
import { Switch2fa } from './Switch2fa';
import { NotifyError } from '../App';

export const SignUp = () => {
  const navigate = useNavigate();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState();

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const form = {
      login: formData.get('login'),
      password: formData.get('password'),
      phoneNumber: formData.get('tel'),
    };
    axios
      .post('http://localhost:3001/app/auth/signup', form)
      .then((res) => {
        sessionStorage.setItem('currentUser', res.data.id);
        document.cookie = res.data.Authorization;
        navigate('/SignIn');
      })
      .catch((err) => {
        let errorMessage = [];
        if (err.response.data[1] === '23505')
          errorMessage[0] = err.response.data[0];
        else {
          for (let m in err.response.data.message)
            NotifyError(err.response.data.message[m]);
        }
      });
  };

  return (
    <div>
      <ReactNotifications />
      <div className="flex-container">
        <div>
          <h1 className="text-center">SIGNUP</h1>
          <form onSubmit={handleSubmit}>
            <div className="mc-menu">
              <input
                className="mc-button full"
                required
                type="text"
                name="login"
                maxLength={15}
                placeholder="login"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
              />
              <input
                className="mc-button full"
                required
                type="password"
                name="password"
                maxLength={15}
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <input
                className="mc-button full"
                type="tel"
                name="tel"
                maxLength={15}
                placeholder="2FA phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <button className="mc-button test">SUBMIT</button>
            <div className="text-center">
              <DisplayErrors errors={errors} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
