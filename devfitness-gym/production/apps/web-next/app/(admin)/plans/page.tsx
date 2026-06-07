import { api } from "../../../lib/api";

export default async function PlansPage() {
  const plans = await api<any>("/plans").catch(() => ({}));
  return <><div className="topbar"><div><h1>Plans</h1><p className="muted">Final V1 pricing.</p></div></div><div className="grid">{Object.entries(plans).map(([key, plan]: any) => <div className="card" key={key}><h2>{plan.label}</h2><pre>{JSON.stringify(plan.prices, null, 2)}</pre></div>)}</div></>;
}
