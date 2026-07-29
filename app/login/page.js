"use client";

import { useState } from "react";

export default function LoginPage() {
  const [password, setPassword] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      window.location.href = "/";
    } else {
      alert("Incorrect password");
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit">Log In</button>
    </form>
  );
}