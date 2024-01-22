import React, { useEffect } from 'react';
import { useRef } from 'react';
import { Container } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Route, Routes, Link, Router } from 'react-router-dom';
import SignIn from './SignInPage';
import axios from 'axios';

const logIntra = () => {
  window.location.href="http://localhost:3001/app/auth";
  // axios.get('http://localhost:3001/app/auth').then((res) => {
  //   console.log(res);
  // }
  // );
};


const Search = () => {
  

  useEffect(() => {
  window.history.pushState(null, null, window.location.href);
    window.onpopstate = function () {
        window.history.go(1);
    };
  }, []);

  return (
    <div className="mc-menu">
      <div className="mc-button full">
        <Nav.Link as={Link} to="/SignIn" className="title">
          Login
        </Nav.Link>
      </div>
      <div className="mc-button full">
        <Nav.Link as={Link} to="/SignUp" className="title">
          SignUp
        </Nav.Link>
      </div>
      <div className="mc-button full">
        <button onClick={() => logIntra()} className="title">
          Login with 42
        </button>
      </div>
    </div>
  );
};

export default Search;
