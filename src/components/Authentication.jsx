import jwt from 'jsonwebtoken';
import PropTypes from 'prop-types';
import { useContext, useEffect, useCallback, useState, createContext } from 'react';
import { useMutate } from 'restful-react';

import { DEV_IGNORE_AUTH } from '../dev.config';

const UserContext = createContext({});

export function useUser() {
  const { login, logout, loading, isAuthenticated, user } = useContext(UserContext);
  return {
    isAuthenticated,
    loading,
    login,
    logout,
    user,
  };
}

export function withProtected(Component, fallback) {
  return (props) => (
    <Protected fallback={fallback}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <Component {...props} />
    </Protected>
  );
}

export function Protected({ children, fallback }) {
  const { loading, isAuthenticated } = useUser();

  if (loading) {
    return 'Loading...';
  }

  if (DEV_IGNORE_AUTH) {
    return children;
  }

  return isAuthenticated ? children : fallback;
}

Protected.propTypes = {
  children: PropTypes.node,
  fallback: PropTypes.node,
};

export function AuthProvider({ children }) {
  const { mutate: refresh } = useMutate({
    path: '/api/account/auth/token/refresh',
    verb: 'POST',
  });

  const { mutate: getMe, loading } = useMutate({ path: '/api/account/users/me', verb: 'GET' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem('auth-token');
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const login = useCallback(
    async (token) => {
      try {
        localStorage.setItem('auth-token', token);
        const payload = jwt.decode(token);
        if (!payload.isStaffUser) throw new Error('You do not have access');
        const res = await getMe();
        setIsAuthenticated(true);
        setUser(res);
        return res;
      } catch (err) {
        localStorage.removeItem('auth-token');
        throw err;
      }
    },
    [getMe]
  );

  useEffect(() => {
    const handler = async () => {
      const token = localStorage.getItem('auth-token');
      if (!token) return;

      try {
        const newJwt = await refresh({ token });
        if (!newJwt.payload.isStaffUser) throw new Error('You do not have access');
        localStorage.setItem('auth-token', newJwt.token);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        logout();
      }
    };
    let timer;
    handler().then(() => {
      timer = window.setInterval(handler, 10000);
    });

    return () => {
      window.clearInterval(timer);
    };
  }, [logout]);

  return (
    <UserContext.Provider value={{ login, logout, loading, isAuthenticated, user }}>
      {children}
    </UserContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};
