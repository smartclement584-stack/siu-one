import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./context";
import {
  getMe,
  getToken,
  login,
  delegateLogin,
  staffLogin,
  logout,
  UNAUTHORIZED_EVENT,
} from "../api";

const toUser = ({ role, matricule, profile }) => ({ role, matricule, profile });

function AuthProvider({ children }) {
  // With no stored token there is nothing to verify, so we're immediately "ready".
  const [state, setState] = useState(() => ({
    status: getToken() ? "loading" : "ready",
    user: null,
    // true only after an explicit Sign Out, so guards send the user to the profile
    // screen (where Sign Out lands) instead of racing to a login page.
    signedOut: false,
  }));

  // Restore the session on load. /auth/me is the source of truth, not local storage.
  useEffect(() => {
    if (!getToken()) return undefined;
    let cancelled = false;

    getMe()
      .then((me) => {
        if (!cancelled) setState({ status: "ready", user: toUser(me), signedOut: false });
      })
      .catch(() => {
        // 401 already cleared the token inside api.js; a network error leaves it
        // in place so a reload can retry. Either way, no verified session now.
        if (!cancelled) setState({ status: "ready", user: null, signedOut: false });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Any API call rejected with 401 (expired token) drops the session -> guards redirect.
  useEffect(() => {
    const onUnauthorized = () =>
      setState({ status: "ready", user: null, signedOut: false });
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const signInStudent = useCallback(async (matricule, password, remember) => {
    const { student } = await login(matricule, password, remember);
    setState({
      status: "ready",
      user: { role: "student", matricule: student.matricule, profile: student },
      signedOut: false,
    });
  }, []);

  const signInDelegate = useCallback(async (delegateId, password) => {
    const { delegate } = await delegateLogin(delegateId, password);
    setState({
      status: "ready",
      user: { role: "delegate", matricule: delegate.delegateId, profile: delegate },
      signedOut: false,
    });
  }, []);

  // Staff and admin share this; resolves to the role the server assigned.
  const signInStaff = useCallback(async (staffId, password) => {
    const { account } = await staffLogin(staffId, password);
    setState({
      status: "ready",
      user: { role: account.role, matricule: account.staffId, profile: account },
      signedOut: false,
    });
    return account.role;
  }, []);

  const signOut = useCallback(() => {
    logout();
    setState({ status: "ready", user: null, signedOut: true });
  }, []);

  const value = useMemo(
    () => ({ ...state, signInStudent, signInDelegate, signInStaff, signOut }),
    [state, signInStudent, signInDelegate, signInStaff, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
