import React, { BaseSyntheticEvent, useContext } from "react";
import { useNavigate } from 'react-router';
import { observer } from "mobx-react";
import { ApplicationContext } from "../../../Store/ApplicationStore";
import { Typography, Button, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import { MaterialCard } from "../../Common/material/card";
import { MaterialStack } from "../../Common/material/stack";


export default observer(() => {
  const store = useContext(ApplicationContext);
  const navigate = useNavigate();
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const data = {
    username: '',
    password: ''
  };
  async function login(e?: BaseSyntheticEvent) {
    let valid = true;
    if(e) e.preventDefault();
    if (!data.username.length) {
      setEmailError(true);
      setEmailErrorMessage('Required');
      valid = false;
    } else {
      setEmailError(false);
    }
    if (!data.password) {
      setPasswordError(true);
      setPasswordErrorMessage('Required');
      valid = false;
    } else {
      setPasswordError(false);
    }
    if (valid) {
      await store.session.login(data.username, data.password);
      navigate('/main/home');
    }
  }
  function googleLogin(credentialResponse: CredentialResponse) {
    store.session.setSession(credentialResponse.clientId);
    navigate('/main/home');
  }

  return (
    <MaterialStack direction="column" justifyContent="space-between">
      {/* { store.session.loading && <Card variant="outlined"><CircularProgress /></Card> } */}
      {store.session && <MaterialCard variant="outlined">
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}>
          SIGN IN
        </Typography>
        <Box
          component="form"
          onSubmit={login}
          noValidate
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: 2,
          }}>
          <FormControl>
            <FormLabel htmlFor="email">Email</FormLabel>
            <TextField
              error={emailError}
              helperText={emailErrorMessage}
              id="login"
              type="text"
              name="login"
              placeholder="your@email.com"
              autoComplete="email"
              autoFocus
              required
              fullWidth
              variant="outlined"
              onChange={(e) => data.username = e.target.value}
              color={emailError ? 'error' : 'primary'} />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="password">Password</FormLabel>
            <TextField
              error={passwordError}
              helperText={passwordErrorMessage}
              name="password"
              placeholder="••••••"
              type="password"
              id="password"
              autoComplete="current-password"
              autoFocus
              required
              fullWidth
              variant="outlined"
              onChange={(e) => data.password = e.target.value}
              color={passwordError ? 'error' : 'primary'} />
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            onClick={login}>
            Sign in
          </Button>
        </Box>
        <Divider>or</Divider>
        <GoogleLogin
          onSuccess={credentialResponse => {
            googleLogin(credentialResponse);
          }}
          onError={() => {}}
        />
      </MaterialCard>}
    </MaterialStack>
  );
});
