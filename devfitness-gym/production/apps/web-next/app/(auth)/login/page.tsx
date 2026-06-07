"use client";

import { FormEvent, useState } from "react";
import { api } from "../../../lib/api";

export default function LoginPage() {
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError("");
    try {
      await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username: formData.get("username"), password: formData.get("password") }),
      });
      window.location.href = "/";
    } catch {
      setError("Invalid username or password");
    }
  }

  return (
    <main className="main" style={{ maxWidth: 420, margin: "80px auto" }}>
      <div className="card">
        <h1>DEV FITNESS GYM</h1>
        <p className="muted">Admin login</p>
        <form onSubmit={submit}>
          <input name="username" placeholder="Username" defaultValue="admin" required />
          <input name="password" placeholder="Password" type="password" required />
          {error && <strong>{error}</strong>}
          <button className="btn primary">Login</button>
        </form>
      </div>
    </main>
  );
}
