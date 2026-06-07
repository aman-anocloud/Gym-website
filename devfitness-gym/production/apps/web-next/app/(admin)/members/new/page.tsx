"use client";

import { FormEvent } from "react";
import { api } from "../../../../lib/api";

export default function NewMemberPage() {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const body = {
      fullName: formData.get("fullName"),
      age: Number(formData.get("age")),
      gender: formData.get("gender"),
      phoneDay: formData.get("phoneDay"),
      address: formData.get("address"),
      city: "Bokaro Steel City",
      state: "Jharkhand",
      pin: formData.get("pin"),
      trainerRequired: formData.get("trainerRequired") === "on",
      healthFlags: [],
      termsAccepted: true,
      planKey: formData.get("planKey"),
      durationMonths: formData.get("durationMonths"),
      waiveRegistration: formData.get("waiveRegistration") === "on",
      amountPaid: Number(formData.get("amountPaid")),
      paymentMode: formData.get("paymentMode"),
    };
    await api("/members", { method: "POST", body: JSON.stringify(body) });
    window.location.href = "/members";
  }
  return (
    <>
      <div className="topbar"><div><h1>Register Member</h1><p className="muted">Production form shell.</p></div></div>
      <form className="card form-grid" onSubmit={submit}>
        <input name="fullName" placeholder="Full name" required />
        <input name="age" type="number" placeholder="Age" required />
        <select name="gender"><option>Male</option><option>Female</option></select>
        <input name="phoneDay" placeholder="10 digit phone" required />
        <input name="address" placeholder="Address" required />
        <input name="pin" placeholder="PIN" required />
        <select name="planKey"><option value="strength">Strength</option><option value="cardio">Strength + Cardio</option></select>
        <select name="durationMonths"><option value="1">1 Month</option><option value="3">3 Months</option><option value="6">6 Months</option><option value="12">12 Months</option></select>
        <input name="amountPaid" type="number" placeholder="Amount paid" defaultValue={1600} required />
        <select name="paymentMode"><option>Cash</option><option>UPI</option><option>Bank Transfer</option></select>
        <label><input name="waiveRegistration" type="checkbox" /> Waive registration fee</label>
        <button className="btn primary">Save Member</button>
      </form>
    </>
  );
}
