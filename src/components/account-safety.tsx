"use client";

import Link from "next/link";
import { useId, useRef, useState, type FormEvent } from "react";
import { reportReasons } from "@/lib/demo-state";
import { type Person } from "@/lib/hangouts";
import { useDemo } from "./demo-provider";

export function AccountSafety({ person, showChat = false }: { person: Person; showChat?: boolean }) {
  const { state, ready, storageError, dispatch } = useDemo();
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [mode, setMode] = useState<"report" | "block" | "unblock">("report");
  const [notice, setNotice] = useState("");
  const blocked = state.blockedAccounts.includes(person.id);

  function open(next: typeof mode) {
    setMode(next);
    setNotice("");
    dialog.current?.showModal();
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready) return;
    const form = event.currentTarget;
    if (mode === "report") {
      const data = new FormData(form);
      dispatch({ type: "report", report: { id: crypto.randomUUID(), personId: person.id, reason: data.get("reason") as typeof reportReasons[number], details: String(data.get("details") ?? "").trim(), createdAt: new Date().toISOString() }, block: data.get("block") === "on" });
      setNotice("Report saved in this browser only. It has not been sent to a moderation team.");
    } else {
      dispatch({ type: mode, personId: person.id });
      setNotice(mode === "block" ? "Account blocked in this browser. Messaging is disabled." : "Account unblocked. Messaging is available again.");
    }
    dialog.current?.close();
    form.reset();
  }

  return <div className="account-safety">
    <div className="safety-actions">
      {showChat && (ready && !blocked ? <Link className="primary" href={`/chat/${person.id}`}>Chat with {person.name.split(" ")[0]} ↗</Link> : <span className="small-note">{ready ? "Account blocked" : "Loading…"}</span>)}
      <button className="quiet-button" disabled={!ready} onClick={() => open("report")}>Report account</button>
      <button className="quiet-button safety-danger" disabled={!ready} onClick={() => open(blocked ? "unblock" : "block")}>{blocked ? "Unblock account" : "Block account"}</button>
    </div>
    <p className="safety-status" role="status">{notice}{storageError && " Browser storage is unavailable; changes will be lost on refresh."}</p>
    <dialog className="safety-dialog" ref={dialog} aria-labelledby={titleId}>
      <form onSubmit={submit} key={mode}>
        <h2 id={titleId}>{mode === "report" ? "Report" : mode === "block" ? "Block" : "Unblock"} {person.name}?</h2>
        {mode === "report" ? <>
          <p>Choose a reason and share any details you feel comfortable providing.</p>
          <label>Reason<select name="reason" required defaultValue=""><option value="" disabled>Select a reason</option>{reportReasons.map((reason) => <option key={reason}>{reason}</option>)}</select></label>
          <label>Details (optional)<textarea name="details" maxLength={2000} rows={4} placeholder="Tell us what happened. Avoid sharing sensitive personal information." /></label>
          {!blocked && <label className="safety-checkbox"><input type="checkbox" name="block" defaultChecked /> Also block this account</label>}
          <p className="small-note">Demo only: this report stays in this browser. No moderation team will receive or review it. For immediate danger, contact emergency services.</p>
        </> : <p>{mode === "block" ? "Messaging with this account will be disabled in this browser. Existing messages are kept. Shared events and in-person attendance are not affected. You can unblock at any time from their profile or chat." : "You will be able to message this account again. Any saved reports will be kept."}</p>}
        <div className="safety-actions"><button className="quiet-button" type="button" onClick={() => dialog.current?.close()}>Cancel</button><button className="primary" type="submit" disabled={!ready}>{mode === "report" ? "Save demo report" : mode === "block" ? "Block account" : "Unblock account"}</button></div>
      </form>
    </dialog>
  </div>;
}
