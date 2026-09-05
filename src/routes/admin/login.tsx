// @ts-nocheck
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
export const Route=createFileRoute("/admin/login")({component:Login});
function Login(){const nav=useNavigate();const [email,setEmail]=useState("");const [password,setPassword]=useState("");const [busy,setBusy]=useState(false);async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);const {error}=await supabase.auth.signInWithPassword({email,password});setBusy(false);if(error)return toast.error(error.message);nav({to:"/admin"})}return <main className="flex min-h-screen items-center justify-center bg-cream p-5"><form onSubmit={submit} className="surface-card w-full max-w-md rounded-lg p-8"><Link to="/" className="text-display text-xl uppercase">Next Step<span className="text-primary">.</span></Link><p className="eyebrow mt-10">Private area</p><h1 className="mt-3 text-3xl uppercase">Admin sign in</h1><div className="mt-7 space-y-4"><div><Label htmlFor="email">Email</Label><Input id="email" type="email" required className="mt-1.5" value={email} onChange={e=>setEmail(e.target.value)}/></div><div><Label htmlFor="password">Password</Label><Input id="password" type="password" required className="mt-1.5" value={password} onChange={e=>setPassword(e.target.value)}/></div></div><Button className="mt-6 w-full" disabled={busy}>{busy?"Signing in…":"Sign in"}</Button></form></main>}
