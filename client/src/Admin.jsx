import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Tags,
  MessageSquare,
  LogOut,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  RefreshCw,
  ShieldCheck,
  Lock,
  ExternalLink,
  ImagePlus,
  CheckCircle2,
  RotateCcw,
  Mail,
  Phone,
  MessageCircle,
  Clock,
  Eye,
  Stethoscope,
  Pill,
  HeartPulse,
  Pencil
} from 'lucide-react';

import { supabase } from './supabase';
import logo from './static/logo.png';

// Admins are now stored in the Supabase "admins" table (see admins_setup.sql).
// To add or remove an administrator you no longer edit this file.
const STORAGE_BUCKET = 'product-images';

const emptyProduct = {
  name: '',
  description: '',
  price: '',
  image_url: '',
  category_id: ''
};

/* ------------------------------------------------------------------
   Styles
   Every class is prefixed with "ad-" so nothing clashes with the
   public website's CSS (the old admin used names like .brand-mark and
   .search-box which the website also uses).
------------------------------------------------------------------- */
const styles = `
.ad-root, .ad-root * { box-sizing: border-box; }

.ad-root {
  min-height: 100vh;
  background: #f1f5ef;
  color: #17251d;
  font-family: Inter, system-ui, -apple-system, 'Segoe UI', sans-serif;
}

.ad-root h1, .ad-root h2, .ad-root h3, .ad-root h4, .ad-root p { margin-top: 0; }

/* ---------- Login ---------- */
.ad-login {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  background: #0d2318;
}

.ad-login-side {
  position: relative;
  overflow: hidden;
  padding: clamp(32px, 5vw, 64px);
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background:
    radial-gradient(circle at 15% 20%, rgba(183,224,79,.22), transparent 45%),
    radial-gradient(circle at 90% 85%, rgba(145,182,75,.18), transparent 45%),
    linear-gradient(160deg, #0d2318, #163d27);
}

.ad-login-side::after {
  content: '';
  position: absolute;
  width: 420px; height: 420px;
  right: -140px; top: -140px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,.12);
}

.ad-login-logo {
  width: 92px; height: 92px;
  border-radius: 50%;
  background: #fff;
  padding: 3px;
  box-shadow: 0 0 0 3px #91b64b, 0 20px 40px -14px rgba(0,0,0,.6);
}
.ad-login-logo img { width: 100%; height: 100%; object-fit: contain; border-radius: 50%; display: block; }

.ad-login-side h2 { font-size: clamp(30px, 3.6vw, 46px); line-height: 1.1; margin: 28px 0 14px; letter-spacing: -.02em; }
.ad-login-side h2 em { font-style: italic; color: #b7e04f; }
.ad-login-side > p { color: rgba(255,255,255,.8); line-height: 1.8; max-width: 460px; margin-bottom: 28px; }

.ad-login-points { display: grid; gap: 12px; max-width: 460px; }
.ad-login-points div {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px; border-radius: 16px;
  background: rgba(255,255,255,.07);
  border: 1px solid rgba(255,255,255,.12);
  font-size: 14.5px;
}
.ad-login-points svg { color: #b7e04f; flex: none; }

.ad-login-form-wrap { display: grid; place-items: center; padding: 28px; background: #f1f5ef; }

.ad-login-card {
  width: 100%; max-width: 420px;
  background: #fff;
  border-radius: 26px;
  padding: 38px;
  box-shadow: 0 30px 70px -30px rgba(13,35,24,.45);
  border: 1px solid #e3ebdf;
}
.ad-login-card h1 { font-size: 27px; margin: 0 0 8px; color: #0f2a1c; }
.ad-login-card p.sub { color: #718078; font-size: 14px; margin-bottom: 8px; }

.ad-label {
  display: block;
  font-size: 13px;
  font-weight: 650;
  margin: 18px 0 8px;
  color: #2a3b30;
}

.ad-input, .ad-select, .ad-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #dce5de;
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  background: #fff;
  color: #17251d;
  font-family: inherit;
  transition: border-color .2s, box-shadow .2s;
}
.ad-input:focus, .ad-select:focus, .ad-textarea:focus {
  border-color: #6f9f3a;
  box-shadow: 0 0 0 4px rgba(145,182,75,.22);
}
.ad-textarea { min-height: 96px; resize: vertical; }

/* ---------- Buttons ---------- */
.ad-btn {
  background: #163d27;
  color: #fff;
  border: 0;
  padding: 12px 18px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 650;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: background .2s, transform .15s, box-shadow .2s;
  text-decoration: none;
}
.ad-btn:hover { background: #0f2a1c; transform: translateY(-1px); }
.ad-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }
.ad-btn.lime { background: #b7e04f; color: #0d2318; }
.ad-btn.lime:hover { background: #a6d13a; }
.ad-btn.ok { background: #2f7d46; }
.ad-btn.ok:hover { background: #256b3a; }

.ad-btn-ghost {
  background: #fff;
  border: 1.5px solid #dce5de;
  color: #34483b;
  padding: 10px 15px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13.5px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: inherit;
  text-decoration: none;
  transition: border-color .2s, background .2s;
}
.ad-btn-ghost:hover { border-color: #91b64b; background: #f7faf2; }
.ad-btn-ghost:disabled { opacity: .55; cursor: not-allowed; }

.ad-icon-btn {
  border: 0; border-radius: 10px; padding: 9px;
  cursor: pointer; display: inline-grid; place-items: center;
  transition: transform .15s, background .2s;
}
.ad-icon-btn:hover { transform: translateY(-1px); }
.ad-icon-btn:disabled { opacity: .5; cursor: not-allowed; }
.ad-icon-btn.edit { color: #315c3d; background: #edf5ee; }
.ad-icon-btn.del { color: #b42318; background: #fff1f0; }
.ad-icon-btn.view { color: #2a5d87; background: #eaf3fb; }
.ad-icon-btn.solve { color: #1f6b38; background: #e3f4e7; }
.ad-icon-btn.reopen { color: #9a5b00; background: #fff4de; }

/* ---------- Layout ---------- */
.ad-layout { display: flex; min-height: 100vh; }

.ad-sidebar {
  width: 262px;
  background: linear-gradient(180deg, #0d2318, #12301f);
  color: #fff;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;
}

.ad-brand { display: flex; align-items: center; gap: 12px; padding: 0 8px 26px; }
.ad-brand-logo {
  width: 50px; height: 50px; border-radius: 50%;
  background: #fff; padding: 2px; flex: none;
  box-shadow: 0 0 0 2px #91b64b;
}
.ad-brand-logo img { width: 100%; height: 100%; object-fit: contain; border-radius: 50%; display: block; }
.ad-brand strong { font-size: 15px; display: block; letter-spacing: .1em; }
.ad-brand small { color: #b7e04f; font-size: 9.5px; letter-spacing: .3em; }

.ad-links { display: grid; gap: 6px; }

.ad-link {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  border: 0;
  padding: 13px 14px;
  color: #c4d2c7;
  background: transparent;
  border-radius: 12px;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  font-family: inherit;
  transition: background .25s, color .25s;
}
.ad-link:hover { background: rgba(255,255,255,.07); color: #fff; }
.ad-link.active {
  background: #b7e04f;
  color: #0d2318;
  font-weight: 700;
  box-shadow: 0 10px 22px -12px rgba(183,224,79,.8);
}
.ad-badge {
  margin-left: auto;
  min-width: 22px; height: 22px; padding: 0 7px;
  border-radius: 999px;
  display: grid; place-items: center;
  background: #ff7a59; color: #fff;
  font-size: 11.5px; font-weight: 700;
}

.ad-side-bottom { margin-top: auto; border-top: 1px solid rgba(255,255,255,.12); padding-top: 18px; }
.ad-user {
  display: flex; align-items: center; gap: 11px;
  padding: 10px; margin-bottom: 8px;
  border-radius: 14px; background: rgba(255,255,255,.06);
}
.ad-avatar {
  width: 40px; height: 40px; border-radius: 50%; flex: none;
  display: grid; place-items: center;
  background: #b7e04f; color: #0d2318; font-weight: 800; font-size: 16px;
}
.ad-user b { display: block; font-size: 13.5px; }
.ad-user small { display: block; color: #a7b9ab; font-size: 11px; overflow-wrap: anywhere; }

.ad-main { flex: 1; min-width: 0; }

.ad-topbar {
  position: sticky; top: 0; z-index: 20;
  height: 72px; padding: 0 32px;
  background: rgba(255,255,255,.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e3ebdf;
  display: flex; justify-content: space-between; align-items: center;
}
.ad-topbar h2 { font-size: 18px; margin: 0; color: #0f2a1c; }
.ad-topbar small { display: block; color: #829087; font-size: 12px; margin-top: 2px; }

.ad-content { padding: 30px 32px 50px; max-width: 1450px; margin: auto; }

.ad-heading h1 { font-size: 27px; margin: 0 0 7px; color: #0f2a1c; }
.ad-heading p { color: #718078; margin: 0; font-size: 14px; }

/* ---------- Greeting banner ---------- */
.ad-hero {
  position: relative;
  overflow: hidden;
  border-radius: 26px;
  padding: clamp(24px, 3.4vw, 40px);
  color: #fff;
  background:
    radial-gradient(circle at 88% 20%, rgba(183,224,79,.32), transparent 42%),
    linear-gradient(135deg, #0d2318, #1f4d2c);
  display: flex; flex-wrap: wrap; gap: 24px;
  align-items: center; justify-content: space-between;
  box-shadow: 0 30px 60px -34px rgba(13,35,24,.7);
}
.ad-hero::after {
  content: ''; position: absolute; width: 300px; height: 300px;
  right: -90px; bottom: -150px; border-radius: 50%;
  border: 1px solid rgba(255,255,255,.14);
}
.ad-hero small { color: #b7e04f; letter-spacing: .18em; font-size: 11.5px; font-weight: 700; }
.ad-hero h1 { font-size: clamp(26px, 3.4vw, 40px); margin: 8px 0 8px; letter-spacing: -.02em; }
.ad-hero h1 span { color: #c6ee55; }
.ad-hero p { margin: 0; color: rgba(255,255,255,.82); font-size: 15px; max-width: 560px; line-height: 1.7; }
.ad-hero-actions { position: relative; z-index: 1; display: flex; flex-wrap: wrap; gap: 10px; }
.ad-hero .ad-btn-ghost { background: rgba(255,255,255,.1); border-color: rgba(255,255,255,.3); color: #fff; }
.ad-hero .ad-btn-ghost:hover { background: rgba(255,255,255,.2); }
.ad-name-edit { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
.ad-name-edit input {
  padding: 10px 14px; border-radius: 12px; border: 1.5px solid rgba(255,255,255,.35);
  background: rgba(255,255,255,.12); color: #fff; font-size: 14px; outline: none; min-width: 220px;
}
.ad-name-edit input::placeholder { color: rgba(255,255,255,.6); }

/* ---------- Stats ---------- */
.ad-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; margin: 24px 0; }
.ad-stat {
  padding: 22px; border-radius: 20px; background: #fff;
  border: 1px solid #e3ebdf;
  transition: transform .3s, box-shadow .3s;
}
.ad-stat:hover { transform: translateY(-4px); box-shadow: 0 20px 36px -26px rgba(13,35,24,.5); }
.ad-stat-top { display: flex; align-items: center; justify-content: space-between; color: #718078; font-size: 13px; font-weight: 600; }
.ad-stat-icon { width: 40px; height: 40px; display: grid; place-items: center; border-radius: 12px; background: #edf5ee; color: #315c3d; }
.ad-stat.warn .ad-stat-icon { background: #fff1e6; color: #c25a14; }
.ad-stat.good .ad-stat-icon { background: #e3f4e7; color: #1f6b38; }
.ad-stat-number { font-size: 32px; font-weight: 800; margin-top: 14px; color: #0f2a1c; }

/* ---------- Panels ---------- */
.ad-panel {
  background: #fff; border: 1px solid #e3ebdf;
  border-radius: 20px; overflow: hidden; margin-top: 22px;
}
.ad-panel-head {
  padding: 19px 22px; border-bottom: 1px solid #edf0ed;
  display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;
}
.ad-panel-head h3 { margin: 0; font-size: 16px; color: #0f2a1c; }

.ad-table-wrap { overflow-x: auto; }
.ad-table { width: 100%; border-collapse: collapse; min-width: 640px; text-align: left; }
.ad-table th { background: #f8fbf5; color: #718078; font-size: 12px; font-weight: 700; letter-spacing: .04em; }
.ad-table th, .ad-table td { padding: 15px 18px; border-bottom: 1px solid #edf0ed; font-size: 13.5px; vertical-align: middle; }
.ad-table td { color: #34483b; }
.ad-table tr:last-child td { border-bottom: 0; }
.ad-table tbody tr { transition: background .2s; }
.ad-table tbody tr:hover { background: #fafcf8; }
.ad-table tr.is-solved td { opacity: .78; }

.ad-thumb { width: 44px; height: 44px; object-fit: cover; border-radius: 11px; background: #edf5ee; flex: none; }
.ad-pname { display: flex; align-items: center; gap: 12px; font-weight: 650; }
.ad-actions { display: flex; gap: 7px; flex-wrap: wrap; }

.ad-search { width: 250px; max-width: 100%; position: relative; }
.ad-search input { padding-left: 38px; }
.ad-search svg { position: absolute; left: 13px; top: 13px; color: #89978e; }

.ad-empty { padding: 48px 20px; text-align: center; color: #829087; font-size: 14px; }
.ad-empty svg { color: #b7c7b9; margin-bottom: 8px; }

.ad-form-panel { background: #fff; border: 1px solid #e3ebdf; border-radius: 20px; padding: 26px; margin-top: 22px; }
.ad-form-panel h3 { color: #0f2a1c; }
.ad-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 18px; }
.ad-form-actions { display: flex; gap: 10px; margin-top: 22px; flex-wrap: wrap; }

.ad-alert { padding: 13px 16px; border-radius: 12px; background: #fff1f0; color: #b42318; font-size: 13.5px; margin: 14px 0; border: 1px solid #f6c9c5; }
.ad-alert.ok { background: #edf8ef; color: #24613a; border-color: #c6e6cd; }

.ad-upload { border: 2px dashed #c5d4c7; border-radius: 16px; padding: 24px; text-align: center; background: #fafcf9; margin-top: 8px; }
.ad-upload label {
  display: inline-flex; align-items: center; gap: 8px;
  background: #163d27; color: #fff; padding: 11px 17px;
  border-radius: 12px; cursor: pointer; font-size: 13px; font-weight: 650;
}
.ad-upload input { display: none; }

.ad-img-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 13px; margin-top: 16px; }
.ad-img { position: relative; aspect-ratio: 1; border: 1px solid #e1e9e2; border-radius: 14px; overflow: hidden; background: #f5f7f4; }
.ad-img img { width: 100%; height: 100%; object-fit: cover; }
.ad-img-x {
  position: absolute; top: 6px; right: 6px; border: 0; border-radius: 50%;
  width: 28px; height: 28px; display: grid; place-items: center;
  background: #fff; color: #b42318; cursor: pointer; box-shadow: 0 2px 8px #0003;
}
.ad-img-main {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: rgba(22,61,39,.92); color: #fff;
  padding: 5px; font-size: 10px; text-align: center; font-weight: 700;
}

/* ---------- Enquiries ---------- */
.ad-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
.ad-tab {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 9px 16px; border-radius: 999px;
  border: 1.5px solid #dce5de; background: #fff; color: #34483b;
  font-size: 13.5px; font-weight: 650; cursor: pointer; font-family: inherit;
  transition: .2s;
}
.ad-tab span { font-size: 11.5px; padding: 2px 8px; border-radius: 999px; background: #edf2ec; }
.ad-tab:hover { border-color: #91b64b; }
.ad-tab.active { background: #163d27; border-color: #163d27; color: #fff; }
.ad-tab.active span { background: rgba(255,255,255,.2); }

.ad-chip { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; white-space: nowrap; }
.ad-chip.pending { background: #fff1e6; color: #b4560f; }
.ad-chip.solved { background: #e3f4e7; color: #1f6b38; }

.ad-msg { max-width: 340px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.6; }
.ad-sub { display: block; color: #829087; font-size: 12px; margin-top: 2px; }

/* ---------- Modal ---------- */
.ad-modal-bg {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(8,26,16,.6); backdrop-filter: blur(4px);
  display: grid; place-items: center; padding: 20px;
  animation: adFade .25s ease;
}
.ad-modal {
  width: 100%; max-width: 580px; max-height: 90vh; overflow-y: auto;
  background: #fff; border-radius: 26px; padding: 30px;
  box-shadow: 0 40px 80px -30px rgba(0,0,0,.7);
  animation: adPop .3s cubic-bezier(.2,.8,.3,1);
}
.ad-modal-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 18px; }
.ad-modal-head h3 { margin: 0 0 6px; font-size: 22px; color: #0f2a1c; }
.ad-detail { display: grid; gap: 12px; margin-bottom: 18px; }
.ad-detail div { display: flex; gap: 12px; align-items: center; padding: 12px 14px; border-radius: 14px; background: #f5f8f2; font-size: 14px; word-break: break-word; }
.ad-detail svg { color: #4f7a1d; flex: none; }
.ad-bubble { padding: 18px; border-radius: 18px; background: #f5f8f2; border: 1px solid #e3ebdf; line-height: 1.8; font-size: 14.5px; color: #2a3b30; white-space: pre-wrap; word-break: break-word; }
.ad-modal-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }

/* ---------- Welcome overlay ---------- */
.ad-welcome {
  position: fixed; inset: 0; z-index: 200;
  display: grid; place-items: center; padding: 24px;
  background:
    radial-gradient(circle at 50% 30%, rgba(183,224,79,.25), transparent 50%),
    rgba(8,26,16,.96);
  color: #fff; text-align: center; cursor: pointer;
  animation: adFade .4s ease;
}
.ad-welcome-card { max-width: 560px; animation: adRise .8s cubic-bezier(.2,.8,.3,1) both; }
.ad-welcome-logo {
  width: 110px; height: 110px; margin: 0 auto 26px; border-radius: 50%;
  background: #fff; padding: 4px;
  box-shadow: 0 0 0 4px #91b64b, 0 0 0 14px rgba(145,182,75,.2);
  animation: adPulse 2.4s ease-in-out infinite;
}
.ad-welcome-logo img { width: 100%; height: 100%; object-fit: contain; border-radius: 50%; display: block; }
.ad-welcome small { color: #b7e04f; letter-spacing: .24em; font-size: 12px; font-weight: 700; }
.ad-welcome h1 { font-size: clamp(32px, 6vw, 54px); margin: 12px 0 12px; letter-spacing: -.02em; line-height: 1.1; }
.ad-welcome h1 span { color: #c6ee55; }
.ad-welcome p { color: rgba(255,255,255,.82); font-size: 16px; line-height: 1.7; margin-bottom: 26px; }
.ad-welcome-bar { height: 4px; border-radius: 4px; background: rgba(255,255,255,.2); overflow: hidden; max-width: 260px; margin: 0 auto 12px; }
.ad-welcome-bar i { display: block; height: 100%; background: #b7e04f; animation: adBar 3.2s linear forwards; }
.ad-welcome em { font-style: normal; font-size: 12px; color: rgba(255,255,255,.6); }

@keyframes adFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes adPop { from { opacity: 0; transform: translateY(20px) scale(.97); } to { opacity: 1; transform: none; } }
@keyframes adRise { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: none; } }
@keyframes adBar { from { width: 0; } to { width: 100%; } }
@keyframes adPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }

@media (max-width: 1100px) {
  .ad-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 900px) {
  .ad-login { grid-template-columns: 1fr; }
  .ad-login-side { display: none; }
  .ad-sidebar { width: 220px; }
  .ad-content { padding: 24px 18px; }
  .ad-topbar { padding: 0 18px; }
}

@media (max-width: 700px) {
  .ad-layout { display: block; }
  .ad-sidebar { width: 100%; height: auto; position: static; padding: 14px; }
  .ad-brand { padding-bottom: 12px; }
  .ad-links { display: flex; overflow-x: auto; gap: 5px; }
  .ad-link { white-space: nowrap; width: auto; padding: 10px 13px; }
  .ad-side-bottom { display: flex; align-items: center; gap: 8px; padding-top: 10px; }
  .ad-user { flex: 1; margin: 0; }
  .ad-topbar { height: 62px; position: static; }
  .ad-content { padding: 20px 14px 40px; }
  .ad-stats { grid-template-columns: 1fr; gap: 12px; }
  .ad-form-grid { grid-template-columns: 1fr; }
  .ad-search { width: 100%; }
  .ad-heading h1 { font-size: 23px; }
  .ad-login-card { padding: 28px 22px; }
}

@media (prefers-reduced-motion: reduce) {
  .ad-welcome-logo, .ad-welcome-card, .ad-modal, .ad-modal-bg, .ad-welcome { animation: none; }
}
`;

/* ------------------------------------------------------------------
   Helpers
------------------------------------------------------------------- */
function getDisplayName(user) {
  const meta = user?.user_metadata || {};
  const fromMeta = meta.full_name || meta.name || meta.display_name;

  if (fromMeta) return String(fromMeta).trim();

  const local = (user?.email || 'Admin').split('@')[0];

  return local
    .replace(/[._-]+/g, ' ')
    .replace(/\d+/g, '')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || 'Admin';
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDateTime(value) {
  if (!value) return '—';

  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function toWhatsAppNumber(phone) {
  const digits = String(phone || '').replace(/\D/g, '');

  if (digits.length === 10) return `91${digits}`;

  return digits;
}

// Checks the "admins" table to see whether this user is an administrator
async function checkIsAdmin(userId) {
  if (!userId) return false;

  const { data, error } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Admin check failed:', error.message);
    return false;
  }

  return Boolean(data);
}

function isSolved(item) {
  return item?.status === 'solved';
}

function getProductImages(product) {
  if (Array.isArray(product.image_urls) && product.image_urls.length) {
    return product.image_urls.filter(Boolean);
  }

  return product.image_url ? [product.image_url] : [];
}

function StatCard({ title, value, icon: Icon, tone = '' }) {
  return (
    <div className={`ad-stat ${tone}`}>
      <div className="ad-stat-top">
        <span>{title}</span>
        <span className="ad-stat-icon"><Icon size={19} /></span>
      </div>
      <div className="ad-stat-number">{value}</div>
    </div>
  );
}

function StatusChip({ solved }) {
  return solved ? (
    <span className="ad-chip solved"><CheckCircle2 size={13} /> Solved</span>
  ) : (
    <span className="ad-chip pending"><Clock size={13} /> Pending</span>
  );
}

/* ------------------------------------------------------------------
   Admin dashboard
------------------------------------------------------------------- */
export default function Admin() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null); // null = still checking
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginName, setLoginName] = useState(() => {
    try {
      return localStorage.getItem('bos_admin_name') || '';
    } catch {
      return '';
    }
  });
  const [nameOverride, setNameOverride] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('Overview');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);

  const [existingImages, setExistingImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);

  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  // Enquiry management
  const [enquiryFilter, setEnquiryFilter] = useState('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [busyId, setBusyId] = useState(null);

  // Welcome message
  const [showWelcome, setShowWelcome] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  // Always holds the latest selected images so they can be released on unmount
  const selectedImagesRef = useRef([]);

  useEffect(() => {
    selectedImagesRef.current = selectedImages;
  }, [selectedImages]);

  useEffect(() => {
    return () => {
      selectedImagesRef.current.forEach((item) =>
        URL.revokeObjectURL(item.preview)
      );
    };
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) setError(error.message);
      setSession(data?.session || null);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // Verify the signed-in user is listed in the admins table
  useEffect(() => {
    const userId = session?.user?.id;
    let cancelled = false;

    if (!userId) {
      setIsAdmin(null);
      return undefined;
    }

    checkIsAdmin(userId).then((allowed) => {
      if (cancelled) return;

      setIsAdmin(allowed);

      if (allowed) loadData();
    });

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  // Hide the welcome overlay automatically
  useEffect(() => {
    if (!showWelcome) return undefined;

    const timer = setTimeout(() => setShowWelcome(false), 3200);

    return () => clearTimeout(timer);
  }, [showWelcome]);

  async function loadData() {
    setDataLoading(true);
    setError('');

    const [productResult, categoryResult, enquiryResult] = await Promise.all([
      supabase.from('products').select('*').order('id', { ascending: false }),
      supabase.from('categories').select('*').order('id', { ascending: false }),
      supabase.from('enquiries').select('*').order('created_at', { ascending: false })
    ]);

    const firstError =
      productResult.error || categoryResult.error || enquiryResult.error;

    if (firstError) {
      setError(firstError.message);
    } else {
      setProducts(productResult.data || []);
      setCategories(categoryResult.data || []);
      setEnquiries(enquiryResult.data || []);
    }

    setDataLoading(false);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoginLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) {
      setError(error.message);
    } else if (!(await checkIsAdmin(data.user?.id))) {
      await supabase.auth.signOut();
      setError('This account is not authorized as an administrator.');
    } else {
      setIsAdmin(true);
      const enteredName = loginName.trim();

      if (enteredName) {
        setNameOverride(enteredName);

        try {
          localStorage.setItem('bos_admin_name', enteredName);
        } catch {
          // Storage may be unavailable; the name still works for this session.
        }

        // Save the name on the account so it is remembered next time.
        await supabase.auth.updateUser({ data: { full_name: enteredName } });
      }

      setShowWelcome(true);
      setPassword('');
    }

    setLoginLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
    setShowWelcome(false);
    setNameOverride('');
  }

  async function saveDisplayName(e) {
    e.preventDefault();

    const value = nameInput.trim();
    if (!value) return;

    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: value }
    });

    if (error) {
      setError(error.message);
    } else {
      if (data?.user) {
        setSession((previous) =>
          previous ? { ...previous, user: data.user } : previous
        );
      }

      setNameOverride(value);
      setNotice('Your display name has been updated.');
      setEditingName(false);
    }
  }

  /* ---------------- Products ---------------- */
  function clearSelectedImages() {
    selectedImages.forEach((item) => URL.revokeObjectURL(item.preview));
    setSelectedImages([]);
  }

  function openAddProduct() {
    clearSelectedImages();
    setEditingProduct(null);
    setExistingImages([]);
    setProductForm(emptyProduct);
    setShowProductForm(true);
    setError('');
    setNotice('');
  }

  function openEditProduct(product) {
    clearSelectedImages();
    setEditingProduct(product);
    setExistingImages(getProductImages(product));
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price ?? '',
      image_url: product.image_url || '',
      category_id: product.category_id ? String(product.category_id) : ''
    });
    setShowProductForm(true);
    setError('');
    setNotice('');
  }

  function handleImageSelection(e) {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => file.type.startsWith('image/'));

    if (validFiles.length !== files.length) {
      setError('Please select image files only.');
    } else {
      setError('');
    }

    const newImages = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setSelectedImages((previous) => [...previous, ...newImages]);

    // Allows selecting the same file again later.
    e.target.value = '';
  }

  function removeExistingImage(index) {
    setExistingImages((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index)
    );
  }

  function removeSelectedImage(index) {
    setSelectedImages((previous) => {
      const item = previous[index];
      if (item) URL.revokeObjectURL(item.preview);

      return previous.filter((_, imageIndex) => imageIndex !== index);
    });
  }

  async function uploadProductImages() {
    const uploadedUrls = [];

    for (const item of selectedImages) {
      const file = item.file;
      const safeName = file.name
        .toLowerCase()
        .replace(/[^a-z0-9.-]/g, '-');

      const filePath =
        `products/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Image upload failed: ${error.message}`);
      }

      const { data: publicData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(data.path);

      if (!publicData?.publicUrl) {
        throw new Error('Could not generate the public image URL.');
      }

      uploadedUrls.push(publicData.publicUrl);
    }

    return uploadedUrls;
  }

  async function saveProduct(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');

    const name = productForm.name.trim();

    const price =
      productForm.price === '' ? null : Number(productForm.price);

    if (!name) {
      setError('Please enter a product name.');
      setSaving(false);
      return;
    }

    if (price !== null && (!Number.isFinite(price) || price < 0)) {
      setError('Please enter a valid price.');
      setSaving(false);
      return;
    }

    try {
      // Upload newly selected images.
      const uploadedUrls = await uploadProductImages();

      // Keep existing images first, then append newly uploaded images.
      const allImages = [...existingImages, ...uploadedUrls];

      const payload = {
        name,
        description: productForm.description.trim(),
        price,
        image_url: allImages[0] || null,
        image_urls: allImages,
        category_id: productForm.category_id
          ? Number(productForm.category_id)
          : null
      };

      let result;

      if (editingProduct) {
        result = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);
      } else {
        result = await supabase
          .from('products')
          .insert([payload]);
      }

      if (result.error) {
        throw new Error(result.error.message);
      }

      setNotice(
        editingProduct
          ? 'Product updated successfully.'
          : 'Product added successfully.'
      );

      clearSelectedImages();
      setShowProductForm(false);
      setProductForm(emptyProduct);
      setExistingImages([]);
      setEditingProduct(null);

      await loadData();
    } catch (uploadError) {
      setError(uploadError.message || 'Something went wrong while saving.');
    }

    setSaving(false);
  }

  async function deleteProduct(product) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', product.id);

    if (error) {
      setError(error.message);
    } else {
      setNotice('Product deleted successfully.');
      await loadData();
    }
  }

  /* ---------------- Categories ---------------- */
  async function addCategory(e) {
    e.preventDefault();
    if (!categoryName.trim()) return;

    setSaving(true);
    setError('');
    setNotice('');

    const { error } = await supabase.from('categories').insert([{
      name: categoryName.trim(),
      description: categoryDescription.trim() || null
    }]);

    if (error) {
      setError(error.message);
    } else {
      setCategoryName('');
      setCategoryDescription('');
      setNotice('Category added successfully.');
      await loadData();
    }

    setSaving(false);
  }

  async function deleteCategory(category) {
    const confirmed = window.confirm(
      `Delete category "${category.name}"? Products using this category may be affected.`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', category.id);

    if (error) setError(error.message);
    else {
      setNotice('Category deleted successfully.');
      await loadData();
    }
  }

  /* ---------------- Enquiries ---------------- */
  async function setEnquiryStatus(item, solved) {
    setBusyId(item.id);
    setError('');
    setNotice('');

    const payload = solved
      ? { status: 'solved', solved_at: new Date().toISOString() }
      : { status: 'pending', solved_at: null };

    const { data, error } = await supabase
      .from('enquiries')
      .update(payload)
      .eq('id', item.id)
      .select();

    if (error) {
      setError(
        `${error.message}. If this mentions a missing "status" column, run the enquiries SQL setup in Supabase.`
      );
    } else if (!data || data.length === 0) {
      setError(
        'The update was blocked by database permissions. Please run the enquiries SQL setup (policies) in Supabase.'
      );
    } else {
      const updated = data[0];

      setEnquiries((previous) =>
        previous.map((row) => (row.id === item.id ? { ...row, ...updated } : row))
      );

      setSelectedEnquiry((current) =>
        current && current.id === item.id ? { ...current, ...updated } : current
      );

      setNotice(
        solved
          ? 'Enquiry marked as solved. You can now delete it if you wish.'
          : 'Enquiry moved back to pending.'
      );
    }

    setBusyId(null);
  }

  async function deleteEnquiry(item) {
    const warning = isSolved(item)
      ? `Delete the enquiry from ${item.name || 'this customer'}? This cannot be undone.`
      : `This enquiry from ${item.name || 'this customer'} is still PENDING.\n\nIt is best to mark it as solved first. Delete it anyway? This cannot be undone.`;

    if (!window.confirm(warning)) return;

    setBusyId(item.id);
    setError('');
    setNotice('');

    const { data, error } = await supabase
      .from('enquiries')
      .delete()
      .eq('id', item.id)
      .select();

    if (error) {
      setError(error.message);
    } else if (!data || data.length === 0) {
      setError(
        'The delete was blocked by database permissions. Please run the enquiries SQL setup (policies) in Supabase.'
      );
    } else {
      setEnquiries((previous) => previous.filter((row) => row.id !== item.id));
      setSelectedEnquiry((current) =>
        current && current.id === item.id ? null : current
      );
      setNotice('Enquiry deleted.');
    }

    setBusyId(null);
  }

  async function clearSolvedEnquiries() {
    const solvedCount = enquiries.filter(isSolved).length;

    if (solvedCount === 0) return;

    const confirmed = window.confirm(
      `Permanently delete all ${solvedCount} solved enquiries? Pending enquiries will not be touched.`
    );

    if (!confirmed) return;

    setError('');
    setNotice('');

    const { data, error } = await supabase
      .from('enquiries')
      .delete()
      .eq('status', 'solved')
      .select();

    if (error) {
      setError(error.message);
    } else if (!data || data.length === 0) {
      setError(
        'The delete was blocked by database permissions. Please run the enquiries SQL setup (policies) in Supabase.'
      );
    } else {
      setEnquiries((previous) => previous.filter((row) => !isSolved(row)));
      setNotice(`${data.length} solved enquiries cleared.`);
    }
  }

  /* ---------------- Derived data ---------------- */
  const pendingCount = useMemo(
    () => enquiries.filter((item) => !isSolved(item)).length,
    [enquiries]
  );

  const solvedCount = enquiries.length - pendingCount;

  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.description || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const filteredCategories = categories.filter((category) =>
    `${category.name} ${category.description || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const filteredEnquiries = enquiries.filter((item) => {
    const matchesStatus =
      enquiryFilter === 'all' ||
      (enquiryFilter === 'solved' ? isSolved(item) : !isSolved(item));

    const matchesSearch =
      `${item.name || ''} ${item.email || ''} ${item.phone || ''} ${item.message || ''}`
        .toLowerCase()
        .includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  /* ---------------- Auth screens ---------------- */
  if (authLoading) {
    return (
      <>
        <style>{styles}</style>
        <div className="ad-root" style={{ padding: 40 }}>
          Loading admin portal...
        </div>
      </>
    );
  }

  if (!session) {
    return (
      <>
        <style>{styles}</style>
        <div className="ad-root">
          <div className="ad-login">
            <div className="ad-login-side">
              <div className="ad-login-logo">
                <img src={logo} alt="Bos Inducs Pharmaceuticals" />
              </div>

              <h2>
                Bos Inducs <em>Pharmaceuticals</em>
                <br />
                Admin Portal
              </h2>

              <p>
                Manage your veterinary and animal-nutrition catalogue and
                respond to every customer enquiry from one secure place.
              </p>

              <div className="ad-login-points">
                <div><Pill size={20} /> Manage products, images and categories</div>
                <div><Stethoscope size={20} /> Respond to customer and doctor enquiries</div>
                <div><HeartPulse size={20} /> Track pending and solved queries</div>
              </div>
            </div>

            <div className="ad-login-form-wrap">
              <form className="ad-login-card" onSubmit={handleLogin}>
                <h1>Welcome back</h1>
                <p className="sub">Sign in to continue to your dashboard.</p>

                <label className="ad-label">Your name</label>
                <input
                  className="ad-input"
                  type="text"
                  placeholder="e.g. Dr. Sharma"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  autoComplete="name"
                  required
                />

                <label className="ad-label">Email address</label>
                <input
                  className="ad-input"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <label className="ad-label">Password</label>
                <input
                  className="ad-input"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                {error && <div className="ad-alert">{error}</div>}

                <button
                  className="ad-btn"
                  style={{ width: '100%', marginTop: 22 }}
                  disabled={loginLoading}
                >
                  <Lock size={16} />
                  {loginLoading ? 'Signing in...' : 'Sign in to dashboard'}
                </button>

                <p style={{ textAlign: 'center', marginTop: 22, fontSize: 12, color: '#718078', marginBottom: 0 }}>
                  <ShieldCheck
                    size={14}
                    style={{ verticalAlign: 'middle', marginRight: 5 }}
                  />
                  Secure administrator access
                </p>
              </form>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (isAdmin === null) {
    return (
      <>
        <style>{styles}</style>
        <div className="ad-root" style={{ padding: 40 }}>
          Checking your access...
        </div>
      </>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <style>{styles}</style>
        <div className="ad-root">
          <div className="ad-login" style={{ gridTemplateColumns: '1fr' }}>
            <div className="ad-login-form-wrap" style={{ minHeight: '100vh' }}>
              <div className="ad-login-card">
                <h1>Access restricted</h1>
                <p className="sub">
                  This account is not authorized to access the admin dashboard.
                  If you should have access, ask an existing administrator to
                  add your account.
                </p>
                <button className="ad-btn" onClick={handleLogout}>
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ---------------- Dashboard ---------------- */
  const adminName = nameOverride || getDisplayName(session.user);
  const firstName = adminName.split(' ')[0];
  const initial = adminName.charAt(0).toUpperCase();

  const navItems = [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'Products', icon: Package },
    { label: 'Categories', icon: Tags },
    { label: 'Enquiries', icon: MessageSquare, badge: pendingCount }
  ];

  function categoryLabel(categoryId) {
    return categories.find(
      (category) => String(category.id) === String(categoryId)
    )?.name || 'Uncategorized';
  }

  function goToTab(label) {
    setActiveTab(label);
    setSearch('');
    setShowProductForm(false);
    setError('');
    setNotice('');
  }

  return (
    <>
      <style>{styles}</style>

      <div className="ad-root">
        {/* Welcome overlay shown right after login */}
        {showWelcome && (
          <div
            className="ad-welcome"
            onClick={() => setShowWelcome(false)}
            role="dialog"
            aria-label="Welcome"
          >
            <div className="ad-welcome-card">
              <div className="ad-welcome-logo">
                <img src={logo} alt="" />
              </div>

              <small>{getGreeting().toUpperCase()}</small>
              <h1>
                Hello, <span>{adminName}</span>
              </h1>
              <p>
                Welcome to the Bos Inducs Pharmaceuticals admin portal.
                {pendingCount > 0
                  ? ` You have ${pendingCount} pending ${pendingCount === 1 ? 'enquiry' : 'enquiries'} waiting for your attention.`
                  : ' All enquiries are up to date. Have a productive day!'}
              </p>

              <div className="ad-welcome-bar"><i /></div>
              <em>Click anywhere to continue</em>
            </div>
          </div>
        )}

        {/* Enquiry detail dialog */}
        {selectedEnquiry && (
          <div
            className="ad-modal-bg"
            onClick={() => setSelectedEnquiry(null)}
          >
            <div
              className="ad-modal"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label="Enquiry details"
            >
              <div className="ad-modal-head">
                <div>
                  <h3>{selectedEnquiry.name || 'Customer enquiry'}</h3>
                  <StatusChip solved={isSolved(selectedEnquiry)} />
                </div>

                <button
                  className="ad-icon-btn edit"
                  onClick={() => setSelectedEnquiry(null)}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="ad-detail">
                <div><Mail size={18} /> {selectedEnquiry.email || 'No email provided'}</div>
                <div><Phone size={18} /> {selectedEnquiry.phone || 'No phone provided'}</div>
                <div><Clock size={18} /> Received {formatDateTime(selectedEnquiry.created_at)}</div>
                {isSolved(selectedEnquiry) && selectedEnquiry.solved_at && (
                  <div><CheckCircle2 size={18} /> Solved {formatDateTime(selectedEnquiry.solved_at)}</div>
                )}
              </div>

              <div className="ad-bubble">
                {selectedEnquiry.message || 'No message provided.'}
              </div>

              <div className="ad-modal-actions">
                {selectedEnquiry.email && (
                  <a
                    className="ad-btn-ghost"
                    href={`mailto:${selectedEnquiry.email}?subject=${encodeURIComponent('Regarding your enquiry - Bos Inducs Pharmaceuticals')}`}
                  >
                    <Mail size={15} /> Reply by email
                  </a>
                )}

                {selectedEnquiry.phone && (
                  <>
                    <a className="ad-btn-ghost" href={`tel:${selectedEnquiry.phone}`}>
                      <Phone size={15} /> Call
                    </a>

                    <a
                      className="ad-btn-ghost"
                      href={`https://wa.me/${toWhatsAppNumber(selectedEnquiry.phone)}?text=${encodeURIComponent(`Hello ${selectedEnquiry.name || ''}, this is Bos Inducs Pharmaceuticals regarding your enquiry.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle size={15} /> WhatsApp
                    </a>
                  </>
                )}
              </div>

              <div className="ad-modal-actions" style={{ marginTop: 12 }}>
                {isSolved(selectedEnquiry) ? (
                  <button
                    className="ad-btn-ghost"
                    disabled={busyId === selectedEnquiry.id}
                    onClick={() => setEnquiryStatus(selectedEnquiry, false)}
                  >
                    <RotateCcw size={15} /> Reopen
                  </button>
                ) : (
                  <button
                    className="ad-btn ok"
                    disabled={busyId === selectedEnquiry.id}
                    onClick={() => setEnquiryStatus(selectedEnquiry, true)}
                  >
                    <CheckCircle2 size={16} /> Mark as solved
                  </button>
                )}

                <button
                  className="ad-btn-ghost"
                  style={{ color: '#b42318' }}
                  disabled={busyId === selectedEnquiry.id}
                  onClick={() => deleteEnquiry(selectedEnquiry)}
                >
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="ad-layout">
          <aside className="ad-sidebar">
            <div className="ad-brand">
              <div className="ad-brand-logo">
                <img src={logo} alt="Bos Inducs Pharmaceuticals" />
              </div>
              <div>
                <strong>BOS INDUCS</strong>
                <small>PHARMACEUTICALS</small>
              </div>
            </div>

            <div className="ad-links">
              {navItems.map(({ label, icon: Icon, badge }) => (
                <button
                  key={label}
                  className={`ad-link ${activeTab === label ? 'active' : ''}`}
                  onClick={() => goToTab(label)}
                >
                  <Icon size={18} />
                  {label}
                  {badge > 0 && <span className="ad-badge">{badge}</span>}
                </button>
              ))}
            </div>

            <div className="ad-side-bottom">
              <div className="ad-user">
                <div className="ad-avatar">{initial}</div>
                <div>
                  <b>{adminName}</b>
                  <small>{session.user.email}</small>
                </div>
              </div>

              <button className="ad-link" onClick={handleLogout}>
                <LogOut size={18} /> Logout
              </button>
            </div>
          </aside>

          <main className="ad-main">
            <header className="ad-topbar">
              <div>
                <h2>{activeTab}</h2>
                <small>Bos Inducs Pharmaceuticals · Admin portal</small>
              </div>

              <button
                className="ad-btn-ghost"
                onClick={loadData}
                disabled={dataLoading}
              >
                <RefreshCw size={15} />
                {dataLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </header>

            <div className="ad-content">
              {error && <div className="ad-alert">{error}</div>}
              {notice && <div className="ad-alert ok">{notice}</div>}

              {/* ---------------- Overview ---------------- */}
              {activeTab === 'Overview' && (
                <>
                  <div className="ad-hero">
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <small>
                        {new Date().toLocaleDateString('en-IN', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }).toUpperCase()}
                      </small>

                      <h1>
                        {getGreeting()}, <span>{firstName}</span>
                      </h1>

                      <p>
                        {pendingCount > 0
                          ? `You have ${pendingCount} pending ${pendingCount === 1 ? 'enquiry' : 'enquiries'} to review today. Let's keep every customer and doctor taken care of.`
                          : 'Everything is up to date. There are no pending enquiries right now.'}
                      </p>

                      {editingName ? (
                        <form className="ad-name-edit" onSubmit={saveDisplayName}>
                          <input
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            placeholder="Your name, e.g. Dr. Sharma"
                            autoFocus
                          />
                          <button className="ad-btn lime" type="submit">Save</button>
                          <button
                            className="ad-btn-ghost"
                            type="button"
                            onClick={() => setEditingName(false)}
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <button
                          className="ad-btn-ghost"
                          style={{ marginTop: 14 }}
                          onClick={() => {
                            setNameInput(adminName);
                            setEditingName(true);
                          }}
                        >
                          <Pencil size={14} /> Change display name
                        </button>
                      )}
                    </div>

                    <div className="ad-hero-actions">
                      <button className="ad-btn lime" onClick={() => { goToTab('Enquiries'); setEnquiryFilter('pending'); }}>
                        <MessageSquare size={16} /> Review enquiries
                      </button>

                      <button
                        className="ad-btn-ghost"
                        onClick={() => { goToTab('Products'); openAddProduct(); }}
                      >
                        <Plus size={16} /> Add product
                      </button>
                    </div>
                  </div>

                  <div className="ad-stats">
                    <StatCard title="Total Products" value={products.length} icon={Package} />
                    <StatCard title="Categories" value={categories.length} icon={Tags} />
                    <StatCard title="Pending Enquiries" value={pendingCount} icon={Clock} tone="warn" />
                    <StatCard title="Solved Enquiries" value={solvedCount} icon={CheckCircle2} tone="good" />
                  </div>

                  <div className="ad-panel">
                    <div className="ad-panel-head">
                      <h3>Pending enquiries</h3>
                      <button
                        className="ad-btn-ghost"
                        onClick={() => { goToTab('Enquiries'); setEnquiryFilter('pending'); }}
                      >
                        View all <ExternalLink size={14} />
                      </button>
                    </div>

                    {pendingCount === 0 ? (
                      <div className="ad-empty">
                        <CheckCircle2 size={32} /><br />
                        All caught up! No pending enquiries.
                      </div>
                    ) : (
                      <div className="ad-table-wrap">
                        <table className="ad-table">
                          <thead>
                            <tr><th>Customer</th><th>Message</th><th>Received</th><th>Actions</th></tr>
                          </thead>
                          <tbody>
                            {enquiries.filter((item) => !isSolved(item)).slice(0, 5).map((item) => (
                              <tr key={item.id}>
                                <td>
                                  <strong>{item.name || '—'}</strong>
                                  <span className="ad-sub">{item.phone || item.email || ''}</span>
                                </td>
                                <td><div className="ad-msg">{item.message || '—'}</div></td>
                                <td>{formatDateTime(item.created_at)}</td>
                                <td>
                                  <div className="ad-actions">
                                    <button className="ad-icon-btn view" title="View" onClick={() => setSelectedEnquiry(item)}>
                                      <Eye size={15} />
                                    </button>
                                    <button
                                      className="ad-icon-btn solve"
                                      title="Mark as solved"
                                      disabled={busyId === item.id}
                                      onClick={() => setEnquiryStatus(item, true)}
                                    >
                                      <CheckCircle2 size={15} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="ad-panel">
                    <div className="ad-panel-head">
                      <h3>Recent products</h3>
                      <button className="ad-btn-ghost" onClick={() => goToTab('Products')}>
                        View all <ExternalLink size={14} />
                      </button>
                    </div>

                    {products.length === 0 ? (
                      <div className="ad-empty">No products found yet.</div>
                    ) : (
                      <div className="ad-table-wrap">
                        <table className="ad-table">
                          <thead>
                            <tr><th>Product</th><th>Category</th><th>Price</th></tr>
                          </thead>
                          <tbody>
                            {products.slice(0, 5).map((product) => (
                              <tr key={product.id}>
                                <td><strong>{product.name}</strong></td>
                                <td>{categoryLabel(product.category_id)}</td>
                                <td>{product.price == null ? '—' : `₹${product.price}`}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ---------------- Products ---------------- */}
              {activeTab === 'Products' && (
                <>
                  <div className="ad-heading">
                    <h1>Products</h1>
                    <p>Add and manage the products displayed on your website.</p>
                  </div>

                  {!showProductForm ? (
                    <div className="ad-panel">
                      <div className="ad-panel-head">
                        <h3>All Products ({products.length})</h3>

                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          <div className="ad-search">
                            <Search size={15} />
                            <input
                              className="ad-input"
                              placeholder="Search products..."
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                            />
                          </div>

                          <button className="ad-btn" onClick={openAddProduct}>
                            <Plus size={16} /> Add Product
                          </button>
                        </div>
                      </div>

                      {filteredProducts.length === 0 ? (
                        <div className="ad-empty">No matching products found.</div>
                      ) : (
                        <div className="ad-table-wrap">
                          <table className="ad-table">
                            <thead>
                              <tr>
                                <th>Product</th><th>Category</th><th>Price</th><th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredProducts.map((product) => (
                                <tr key={product.id}>
                                  <td>
                                    <div className="ad-pname">
                                      {getProductImages(product)[0] ? (
                                        <img
                                          className="ad-thumb"
                                          src={getProductImages(product)[0]}
                                          alt=""
                                        />
                                      ) : (
                                        <div className="ad-thumb" />
                                      )}
                                      {product.name}
                                    </div>
                                  </td>

                                  <td>{categoryLabel(product.category_id)}</td>
                                  <td>{product.price == null ? '—' : `₹${product.price}`}</td>

                                  <td>
                                    <div className="ad-actions">
                                      <button
                                        className="ad-icon-btn edit"
                                        title="Edit"
                                        onClick={() => openEditProduct(product)}
                                      >
                                        <Edit size={15} />
                                      </button>
                                      <button
                                        className="ad-icon-btn del"
                                        title="Delete"
                                        onClick={() => deleteProduct(product)}
                                      >
                                        <Trash2 size={15} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ) : (
                    <form className="ad-form-panel" onSubmit={saveProduct}>
                      <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>

                      <div className="ad-form-grid">
                        <div>
                          <label className="ad-label">Product Name *</label>
                          <input
                            className="ad-input"
                            value={productForm.name}
                            onChange={(e) =>
                              setProductForm({ ...productForm, name: e.target.value })
                            }
                            placeholder="Enter product name"
                            required
                          />
                        </div>

                        <div>
                          <label className="ad-label">Price (₹)</label>
                          <input
                            className="ad-input"
                            type="number"
                            min="0"
                            step="0.01"
                            value={productForm.price}
                            onChange={(e) =>
                              setProductForm({ ...productForm, price: e.target.value })
                            }
                            placeholder="Optional"
                          />
                        </div>

                        <div>
                          <label className="ad-label">Category</label>
                          <select
                            className="ad-select"
                            value={productForm.category_id}
                            onChange={(e) =>
                              setProductForm({ ...productForm, category_id: e.target.value })
                            }
                          >
                            <option value="">Select category</option>
                            {categories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <label className="ad-label">Product Images</label>

                      <div className="ad-upload">
                        <ImagePlus size={30} color="#315c3d" />
                        <p style={{ margin: '10px 0 13px', fontSize: 13, color: '#718078' }}>
                          Select multiple product images from your computer.
                        </p>

                        <label>
                          <Plus size={16} /> Choose Images
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageSelection}
                          />
                        </label>

                        <p style={{ margin: '12px 0 0', fontSize: 11, color: '#829087' }}>
                          You can select multiple images at once.
                        </p>
                      </div>

                      {(existingImages.length > 0 || selectedImages.length > 0) && (
                        <>
                          <p className="ad-label">
                            Image Preview ({existingImages.length + selectedImages.length})
                          </p>

                          <div className="ad-img-grid">
                            {existingImages.map((url, index) => (
                              <div className="ad-img" key={`existing-${index}`}>
                                <img src={url} alt={`Product ${index + 1}`} />

                                {index === 0 && (
                                  <div className="ad-img-main">Main Image</div>
                                )}

                                <button
                                  type="button"
                                  className="ad-img-x"
                                  title="Remove image"
                                  onClick={() => removeExistingImage(index)}
                                >
                                  <X size={15} />
                                </button>
                              </div>
                            ))}

                            {selectedImages.map((item, index) => (
                              <div className="ad-img" key={item.preview}>
                                <img src={item.preview} alt={`New product ${index + 1}`} />

                                <button
                                  type="button"
                                  className="ad-img-x"
                                  title="Remove image"
                                  onClick={() => removeSelectedImage(index)}
                                >
                                  <X size={15} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      <label className="ad-label">Description</label>
                      <textarea
                        className="ad-textarea"
                        value={productForm.description}
                        onChange={(e) =>
                          setProductForm({ ...productForm, description: e.target.value })
                        }
                        placeholder="Write a short product description..."
                      />

                      <div className="ad-form-actions">
                        <button className="ad-btn" disabled={saving}>
                          {saving
                            ? 'Uploading and Saving...'
                            : editingProduct
                              ? 'Update Product'
                              : 'Save Product'}
                        </button>

                        <button
                          type="button"
                          className="ad-btn-ghost"
                          onClick={() => {
                            clearSelectedImages();
                            setShowProductForm(false);
                            setExistingImages([]);
                            setEditingProduct(null);
                            setProductForm(emptyProduct);
                            setError('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}

              {/* ---------------- Categories ---------------- */}
              {activeTab === 'Categories' && (
                <>
                  <div className="ad-heading">
                    <h1>Categories</h1>
                    <p>Organize your products into categories.</p>
                  </div>

                  <form className="ad-form-panel" onSubmit={addCategory}>
                    <h3>Add New Category</h3>

                    <div className="ad-form-grid">
                      <div>
                        <label className="ad-label">Category Name *</label>
                        <input
                          className="ad-input"
                          value={categoryName}
                          onChange={(e) => setCategoryName(e.target.value)}
                          placeholder="e.g. Veterinary Medicines"
                          required
                        />
                      </div>

                      <div>
                        <label className="ad-label">Description</label>
                        <input
                          className="ad-input"
                          value={categoryDescription}
                          onChange={(e) => setCategoryDescription(e.target.value)}
                          placeholder="Optional description"
                        />
                      </div>
                    </div>

                    <div className="ad-form-actions">
                      <button className="ad-btn" disabled={saving}>
                        <Plus size={16} /> {saving ? 'Adding...' : 'Add Category'}
                      </button>
                    </div>
                  </form>

                  <div className="ad-panel">
                    <div className="ad-panel-head">
                      <h3>All Categories ({categories.length})</h3>

                      <div className="ad-search">
                        <Search size={15} />
                        <input
                          className="ad-input"
                          placeholder="Search categories..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                      </div>
                    </div>

                    {filteredCategories.length === 0 ? (
                      <div className="ad-empty">No categories found.</div>
                    ) : (
                      <div className="ad-table-wrap">
                        <table className="ad-table">
                          <thead>
                            <tr><th>Name</th><th>Description</th><th>Actions</th></tr>
                          </thead>
                          <tbody>
                            {filteredCategories.map((category) => (
                              <tr key={category.id}>
                                <td><strong>{category.name}</strong></td>
                                <td>{category.description || '—'}</td>
                                <td>
                                  <button
                                    className="ad-icon-btn del"
                                    onClick={() => deleteCategory(category)}
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ---------------- Enquiries ---------------- */}
              {activeTab === 'Enquiries' && (
                <>
                  <div className="ad-heading">
                    <h1>Customer Enquiries</h1>
                    <p>
                      Review messages from your website, mark them solved once
                      handled, and clear them when you no longer need them.
                    </p>
                  </div>

                  <div className="ad-panel">
                    <div className="ad-panel-head">
                      <div className="ad-tabs">
                        {[
                          ['all', 'All', enquiries.length],
                          ['pending', 'Pending', pendingCount],
                          ['solved', 'Solved', solvedCount]
                        ].map(([key, label, count]) => (
                          <button
                            key={key}
                            className={enquiryFilter === key ? 'ad-tab active' : 'ad-tab'}
                            onClick={() => setEnquiryFilter(key)}
                          >
                            {label} <span>{count}</span>
                          </button>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <div className="ad-search">
                          <Search size={15} />
                          <input
                            className="ad-input"
                            placeholder="Search enquiries..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                          />
                        </div>

                        {solvedCount > 0 && (
                          <button
                            className="ad-btn-ghost"
                            style={{ color: '#b42318' }}
                            onClick={clearSolvedEnquiries}
                          >
                            <Trash2 size={15} /> Clear solved ({solvedCount})
                          </button>
                        )}
                      </div>
                    </div>

                    {filteredEnquiries.length === 0 ? (
                      <div className="ad-empty">
                        <MessageSquare size={32} /><br />
                        {enquiryFilter === 'pending'
                          ? 'No pending enquiries. Great work!'
                          : 'No enquiries found.'}
                      </div>
                    ) : (
                      <div className="ad-table-wrap">
                        <table className="ad-table">
                          <thead>
                            <tr>
                              <th>Customer</th>
                              <th>Message</th>
                              <th>Received</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredEnquiries.map((item) => {
                              const solved = isSolved(item);

                              return (
                                <tr key={item.id} className={solved ? 'is-solved' : ''}>
                                  <td>
                                    <strong>{item.name || '—'}</strong>
                                    <span className="ad-sub">{item.email || '—'}</span>
                                    <span className="ad-sub">{item.phone || ''}</span>
                                  </td>

                                  <td><div className="ad-msg">{item.message || '—'}</div></td>
                                  <td>{formatDateTime(item.created_at)}</td>
                                  <td><StatusChip solved={solved} /></td>

                                  <td>
                                    <div className="ad-actions">
                                      <button
                                        className="ad-icon-btn view"
                                        title="View details"
                                        onClick={() => setSelectedEnquiry(item)}
                                      >
                                        <Eye size={15} />
                                      </button>

                                      {solved ? (
                                        <button
                                          className="ad-icon-btn reopen"
                                          title="Reopen"
                                          disabled={busyId === item.id}
                                          onClick={() => setEnquiryStatus(item, false)}
                                        >
                                          <RotateCcw size={15} />
                                        </button>
                                      ) : (
                                        <button
                                          className="ad-icon-btn solve"
                                          title="Mark as solved"
                                          disabled={busyId === item.id}
                                          onClick={() => setEnquiryStatus(item, true)}
                                        >
                                          <CheckCircle2 size={15} />
                                        </button>
                                      )}

                                      <button
                                        className="ad-icon-btn del"
                                        title="Delete"
                                        disabled={busyId === item.id}
                                        onClick={() => deleteEnquiry(item)}
                                      >
                                        <Trash2 size={15} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}

              {dataLoading && (
                <p style={{ color: '#718078', fontSize: 13, marginTop: 18 }}>
                  Loading your database information...
                </p>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}