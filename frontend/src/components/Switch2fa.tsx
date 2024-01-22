import React, { useState } from 'react';
import axios from 'axios';

export const Switch2fa = (props) => {
  const handleClick = async (event: any) => {
    event.preventDefault();
    await axios
      .get(
        `http://localhost:3001/app/users/switch2fa/${sessionStorage.getItem(
          'currentUser',
        )}`,
      )
      .then((res) => {
        console.log(res.data);
        window.location.reload();
      })
      .catch((err) => {
        console.error(err.response.data);
      });
  };

  return (
    <div className="center">
      <div style={{ color: 'white' }}>
        <button className="mc-button fa" onClick={handleClick}>
          {props.label2fa}
        </button>
      </div>
    </div>
  );
};
