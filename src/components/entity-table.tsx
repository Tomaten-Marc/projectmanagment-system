"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { ArrowDownUp, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { deleteEntity, saveEntity, type ActionState } from "@/app/actions";
import { StatusBadge } from "@/components/status-badge";

export type FieldConfig = { key: string; label: string; type?: "text" | "textarea" | "select" | "checkbox" | "date" | "number"; options?: string[]; required?: boolean; hidden?: boolean };
export type ColumnConfig = { key: string; label: string; badge?: boolean };
type EditableTable = "tasks" | "open_questions" | "decisions" | "stakeholders" | "access_requests" | "roadmap_items";

const initialState: ActionState = { ok: false, message: "" };
const asText = (value: unknown) => value == null ? "" : String(value);

export function EntityTable({ title, table, records, fields, columns, workPackages, fixedWorkPackageId }: {
  title: string; table: EditableTable; records: Record<string, unknown>[]; fields: FieldConfig[]; columns: ColumnConfig[];
  workPackages?: { id: string; code: string }[]; fixedWorkPackageId?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [ap, setAp] = useState(fixedWorkPackageId ?? "all");
  const [priority, setPriority] = useState("all");
  const [blocking, setBlocking] = useState("all");
  const [sort, setSort] = useState(columns[0]?.key ?? "id");
  const [descending, setDescending] = useState(false);
  const [deleting, startDelete] = useTransition();
  const boundSave = saveEntity.bind(null, table);
  const [state, formAction, pending] = useActionState(boundSave, initialState);

  useEffect(() => { if (state.ok) dialog.current?.close(); }, [state]);
  const statuses = [...new Set(records.map((r) => asText(r.status)).filter(Boolean))];
  const priorities = [...new Set(records.map((r) => asText(r.priority)).filter(Boolean))];
  const visible = records.filter((record) => {
    const haystack = Object.values(record).map(asText).join(" ").toLowerCase();
    return haystack.includes(query.toLowerCase()) && (status === "all" || record.status === status) &&
      (ap === "all" || record.work_package_id === ap) && (priority === "all" || record.priority === priority) &&
      (blocking === "all" || String(record.blocking) === blocking);
  }).sort((a,b) => asText(a[sort]).localeCompare(asText(b[sort]), undefined, { numeric: true }) * (descending ? -1 : 1));

  function open(record: Record<string, unknown> | null) { setEditing(record); dialog.current?.showModal(); }
  function remove(id: string) {
    if (!window.confirm("Delete this record permanently? This action cannot be undone.")) return;
    startDelete(async () => { await deleteEntity(table, id); });
  }
  return <section className="data-section">
    <div className="table-heading"><div><h2>{title}</h2><span>{visible.length} records</span></div><button className="primary-button compact" onClick={() => open(null)}><Plus size={16} />Create</button></div>
    <div className="table-tools">
      <label className="search-box"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search records…" /></label>
      {statuses.length > 0 && <select aria-label="Status filter" value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All statuses</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select>}
      {!fixedWorkPackageId && workPackages && <select aria-label="AP filter" value={ap} onChange={(e) => setAp(e.target.value)}><option value="all">All work packages</option>{workPackages.map((wp) => <option key={wp.id} value={wp.id}>{wp.code}</option>)}</select>}
      {priorities.length > 0 && <select aria-label="Priority filter" value={priority} onChange={(e) => setPriority(e.target.value)}><option value="all">All priorities</option>{priorities.map((item) => <option key={item}>{item}</option>)}</select>}
      {records.some((r) => typeof r.blocking === "boolean") && <select aria-label="Blocking filter" value={blocking} onChange={(e) => setBlocking(e.target.value)}><option value="all">All blocking states</option><option value="true">Blocking</option><option value="false">Not blocking</option></select>}
    </div>
    <div className="table-scroll"><table><thead><tr>{columns.map((column) => <th key={column.key}><button onClick={() => { if(sort === column.key) setDescending(!descending); else setSort(column.key); }}>{column.label}<ArrowDownUp size={13} /></button></th>)}<th><span className="sr-only">Actions</span></th></tr></thead>
      <tbody>{visible.map((record) => <tr key={asText(record.id)}>{columns.map((column) => <td key={column.key}>{column.badge && record[column.key] ? <StatusBadge value={asText(record[column.key])} /> : column.key === "work_package_id" ? workPackages?.find((wp) => wp.id === record[column.key])?.code : column.key === "blocking" ? (record[column.key] ? "Yes" : "No") : asText(record[column.key]) || "—"}</td>)}<td className="row-actions"><button onClick={() => open(record)} title="Edit"><Pencil size={15} /></button><button disabled={deleting} onClick={() => remove(asText(record.id))} title="Delete"><Trash2 size={15} /></button></td></tr>)}
      {!visible.length && <tr><td colSpan={columns.length + 1} className="empty-table">No records match the current filters.</td></tr>}</tbody></table></div>
    <dialog ref={dialog} className="entity-dialog" onClose={() => setEditing(null)}>
      <form action={formAction} key={asText(editing?.id) || "new"}>
        <header><div><p className="eyebrow">{editing ? "EDIT RECORD" : "NEW RECORD"}</p><h2>{title}</h2></div><button type="button" onClick={() => dialog.current?.close()} aria-label="Close"><X /></button></header>
        <input type="hidden" name="id" value={asText(editing?.id)} />
        {fields.map((field) => field.hidden ? <input key={field.key} type="hidden" name={field.key} value={asText(editing?.[field.key]) || fixedWorkPackageId || ""} /> : <div className={`field ${field.type === "textarea" ? "wide" : ""}`} key={field.key}><label htmlFor={`${table}-${field.key}`}>{field.label}</label>{renderField(field, editing?.[field.key], workPackages, fixedWorkPackageId)}</div>)}
        {state.message && !state.ok && <p className="form-error wide" role="alert">{state.message}</p>}
        <footer><button type="button" className="secondary-button" onClick={() => dialog.current?.close()}>Cancel</button><button className="primary-button" disabled={pending}>{pending ? "Saving…" : "Save record"}</button></footer>
      </form>
    </dialog>
  </section>;
}

function renderField(field: FieldConfig, value: unknown, workPackages?: {id:string;code:string}[], fixed?: string) {
  const id = `${field.key}`; const common = { id, name: field.key, required: field.required };
  if (field.key === "work_package_id") return <select {...common} defaultValue={asText(value) || fixed || ""}><option value="" disabled>Select work package</option>{workPackages?.map((wp) => <option key={wp.id} value={wp.id}>{wp.code}</option>)}</select>;
  if (field.type === "textarea") return <textarea {...common} defaultValue={asText(value)} rows={3} />;
  if (field.type === "select") return <select {...common} defaultValue={asText(value) || field.options?.[0]}>{field.options?.map((option) => <option key={option} value={option}>{option.replaceAll("_", " ")}</option>)}</select>;
  if (field.type === "checkbox") return <input {...common} type="checkbox" defaultChecked={Boolean(value)} />;
  return <input {...common} type={field.type ?? "text"} defaultValue={asText(value)} />;
}