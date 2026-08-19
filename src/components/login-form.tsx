"use client";

import { useActionState } from "react";
import { LockKeyhole, LoaderCircle } from "lucide-react";
import { login, type LoginState } from "@/app/login/actions";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initialState);
  return (
    <form action={action} className="login-form">
      <div className="field">
        <label htmlFor="username">Username</label>
        <input id="username" name="username" autoComplete="username" required autoFocus />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {state.error && <p className="form-error" role="alert">{state.error}</p>}
      <button className="primary-button" disabled={pending} type="submit">
        {pending ? <LoaderCircle className="spin" size={17} /> : <LockKeyhole size={17} />}
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}