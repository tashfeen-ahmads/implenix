'use client';

import { useEffect, useId, useMemo, useRef, useState, type DragEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';
import { FileUp, Upload, X } from 'lucide-react';
import { Button, Field, TableWrap, inputClass, tdClass, thClass } from '@/components/admin/ui';
import { errorMessage, postJson } from './shared';

// CSV importer: parse with a header row, auto-map columns to contact
// fields, let the user adjust, preview, then send to the engine's import
// endpoint in chunks of 500.

const TARGETS = [
  { value: 'email', label: 'Email' },
  { value: 'first_name', label: 'First name' },
  { value: 'last_name', label: 'Last name' },
  { value: 'company', label: 'Company' },
  { value: 'website', label: 'Website' },
  { value: 'phone', label: 'Phone' },
  { value: 'industry', label: 'Industry' },
  { value: 'city', label: 'City' },
  { value: 'state', label: 'State' },
] as const;
type Target = (typeof TARGETS)[number]['value'];

// '' = not mapped (goes to custom when the toggle is on), 'skip' = ignore.
type Mapping = Record<string, Target | '' | 'skip'>;

const ALIASES: Record<Target, string[]> = {
  email: ['email', 'e-mail', 'emailaddress', 'email address', 'mail', 'workemail', 'contactemail'],
  first_name: ['firstname', 'first name', 'first', 'fname', 'givenname'],
  last_name: ['lastname', 'last name', 'last', 'lname', 'surname', 'familyname'],
  company: ['company', 'companyname', 'business name', 'businessname', 'business', 'organization', 'organisation', 'account', 'name of business'],
  website: ['website', 'url', 'site', 'websiteurl', 'web', 'domain', 'homepage'],
  phone: ['phone', 'phonenumber', 'phone number', 'mobile', 'telephone', 'tel', 'cell'],
  industry: ['industry', 'category', 'niche', 'vertical', 'type'],
  city: ['city', 'town', 'locality'],
  state: ['state', 'region', 'province', 'statecode'],
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const EMAIL_RE = /^[^\s@<>(),;:"]+@[^\s@<>(),;:"]+\.[a-z]{2,}$/i;
const CHUNK = 500;

function autoMap(headers: string[]): Mapping {
  const map: Mapping = {};
  const used = new Set<Target>();
  for (const h of headers) {
    const n = norm(h);
    let hit: Target | '' = '';
    for (const t of TARGETS) {
      if (used.has(t.value)) continue;
      if (ALIASES[t.value].some((a) => norm(a) === n)) {
        hit = t.value;
        break;
      }
    }
    if (hit) used.add(hit);
    map[h] = hit;
  }
  // Second pass: loose "contains" match for email, e.g. "Primary Email".
  if (!used.has('email')) {
    const h = headers.find((x) => map[x] === '' && norm(x).includes('email'));
    if (h) map[h] = 'email';
  }
  return map;
}

function customKey(header: string) {
  return header.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'field';
}

type ImportRow = {
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  website?: string;
  phone?: string;
  industry?: string;
  city?: string;
  state?: string;
  custom?: Record<string, string>;
};

type ImportResult = {
  listId?: string;
  inserted?: number;
  updated?: number;
  skippedInvalid?: number;
  skippedSuppressed?: number;
};

export function CsvImporter() {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Mapping>({});
  const [keepCustom, setKeepCustom] = useState(true);
  const [listName, setListName] = useState('');
  const [dragging, setDragging] = useState(false);
  const [parseError, setParseError] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const reset = () => {
    setFileName('');
    setHeaders([]);
    setRows([]);
    setMapping({});
    setListName('');
    setParseError('');
    setProgress('');
    setResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const close = () => {
    if (busy) return;
    setOpen(false);
    if (result) router.refresh();
    reset();
  };

  const loadFile = (file: File) => {
    reset();
    if (!/\.(csv|txt)$/i.test(file.name) && file.type && !file.type.includes('csv') && file.type !== 'text/plain') {
      setParseError('Please choose a .csv file.');
      return;
    }
    setFileName(file.name);
    setListName(file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim());
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (h) => h.trim(),
      complete: (res) => {
        const hs = (res.meta.fields ?? []).filter((h) => h !== '');
        if (!hs.length) {
          setParseError('No header row found. The first row of the file must contain column names.');
          return;
        }
        setHeaders(hs);
        setRows(res.data);
        setMapping(autoMap(hs));
      },
      error: (err) => setParseError(`Could not read the file: ${err.message}`),
    });
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) loadFile(f);
  };

  const emailHeader = useMemo(() => headers.find((h) => mapping[h] === 'email'), [headers, mapping]);

  const built = useMemo(() => {
    const valid: ImportRow[] = [];
    let invalid = 0;
    let duplicates = 0;
    const seen = new Set<string>();
    if (!emailHeader) return { valid, invalid: rows.length, duplicates };
    for (const r of rows) {
      const email = (r[emailHeader] ?? '').trim().replace(/^mailto:/i, '');
      if (!EMAIL_RE.test(email)) {
        invalid++;
        continue;
      }
      const key = email.toLowerCase();
      if (seen.has(key)) {
        duplicates++;
        continue;
      }
      seen.add(key);
      const out: ImportRow = { email };
      const custom: Record<string, string> = {};
      for (const h of headers) {
        const target = mapping[h];
        const v = (r[h] ?? '').trim();
        if (!v || target === 'skip' || target === 'email') continue;
        if (target) out[target] = v;
        else if (keepCustom) custom[customKey(h)] = v;
      }
      if (Object.keys(custom).length) out.custom = custom;
      valid.push(out);
    }
    return { valid, invalid, duplicates };
  }, [rows, headers, mapping, emailHeader, keepCustom]);

  const setTarget = (header: string, value: Target | '' | 'skip') => {
    setMapping((m) => {
      const next = { ...m };
      // A field can only be mapped from one column.
      if (value && value !== 'skip') {
        for (const h of Object.keys(next)) if (next[h] === value) next[h] = '';
      }
      next[header] = value;
      return next;
    });
  };

  const runImport = async () => {
    if (!built.valid.length || !listName.trim()) return;
    setBusy(true);
    setError('');
    setResult(null);
    const total: Required<ImportResult> = { listId: '', inserted: 0, updated: 0, skippedInvalid: built.invalid, skippedSuppressed: 0 };
    const chunks = Math.ceil(built.valid.length / CHUNK);
    try {
      for (let i = 0; i < chunks; i++) {
        setProgress(`Importing batch ${i + 1} of ${chunks}…`);
        const res = await postJson<ImportResult>('/api/admin/outreach/contacts/import', {
          listName: listName.trim(),
          sourceFile: fileName || undefined,
          // After the first batch, ask the engine to reuse the same list.
          ...(total.listId ? { listId: total.listId } : {}),
          rows: built.valid.slice(i * CHUNK, (i + 1) * CHUNK),
        });
        total.listId ||= res.listId ?? '';
        total.inserted += res.inserted ?? 0;
        total.updated += res.updated ?? 0;
        total.skippedInvalid += res.skippedInvalid ?? 0;
        total.skippedSuppressed += res.skippedSuppressed ?? 0;
      }
      setResult(total);
      setProgress('');
    } catch (err) {
      setError(`${errorMessage(err)}. ${total.inserted + total.updated} contacts were saved before the error.`);
      setProgress('');
      if (total.inserted + total.updated) setResult(total);
    } finally {
      setBusy(false);
    }
  };

  const preview = rows.slice(0, 5);
  const mappedHeaders = headers.filter((h) => mapping[h] !== 'skip' && (mapping[h] || keepCustom));

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Upload size={16} aria-hidden /> Import CSV
      </Button>
      <dialog
        ref={dialogRef}
        aria-labelledby={`${uid}-title`}
        onClose={() => {
          if (open) close();
        }}
        onCancel={(e) => {
          if (busy) e.preventDefault();
        }}
        className="w-[min(60rem,calc(100vw-2rem))] max-h-[calc(100vh-2rem)] bg-[#0b0b14] text-white border border-white/15 rounded-md p-0 backdrop:bg-black/70"
      >
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-white/10 sticky top-0 bg-[#0b0b14] z-10">
          <h2 id={`${uid}-title`} className="font-heading text-lg">
            Import contacts from CSV
          </h2>
          <Button variant="ghost" onClick={close} disabled={busy} aria-label="Close importer">
            <X size={16} aria-hidden /> Close
          </Button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Step 1: file */}
          <label
            htmlFor={`${uid}-file`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`flex flex-col items-center justify-center gap-2 border border-dashed rounded-md px-6 py-8 text-center cursor-pointer transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-brand-cyan ${
              dragging ? 'border-brand-cyan bg-brand-cyan/5' : 'border-white/20 hover:bg-white/[0.03]'
            }`}
          >
            <FileUp size={22} aria-hidden className="text-white/70" />
            <span className="font-body text-sm text-white">
              {fileName ? (
                <>
                  <span className="font-semibold">{fileName}</span> · {rows.length.toLocaleString()} rows
                </>
              ) : (
                'Drop a CSV file here, or click to choose one'
              )}
            </span>
            <span className="font-body text-xs text-white/55">The first row must be column names. Needs an email column.</span>
            <input
              ref={fileInputRef}
              id={`${uid}-file`}
              type="file"
              accept=".csv,text/csv,text/plain"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) loadFile(f);
              }}
            />
          </label>
          {parseError ? (
            <p role="alert" className="font-body text-sm text-red-300">
              {parseError}
            </p>
          ) : null}

          {headers.length ? (
            <>
              {/* Step 2: mapping */}
              <section aria-labelledby={`${uid}-map`}>
                <h3 id={`${uid}-map`} className="font-body text-sm font-semibold text-white">
                  Match columns to contact fields
                </h3>
                <p className="mt-1 font-body text-xs text-white/60">
                  We guessed from the column names. Unmatched columns can be kept as custom fields and used in
                  templates as {'{{custom.column_name}}'}.
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {headers.map((h, i) => (
                    <Field key={h} label={h} htmlFor={`${uid}-col-${i}`} hint={`e.g. ${(rows.find((r) => r[h])?.[h] ?? '').slice(0, 40) || '(empty)'}`}>
                      <select
                        id={`${uid}-col-${i}`}
                        className={inputClass}
                        value={mapping[h] ?? ''}
                        onChange={(e) => setTarget(h, e.target.value as Target | '' | 'skip')}
                      >
                        <option value="">{keepCustom ? `Custom field (${customKey(h)})` : 'Not mapped (ignored)'}</option>
                        {TARGETS.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                        <option value="skip">Ignore this column</option>
                      </select>
                    </Field>
                  ))}
                </div>
                <label className="mt-4 inline-flex items-center gap-2 font-body text-sm text-white/85">
                  <input
                    type="checkbox"
                    checked={keepCustom}
                    onChange={(e) => setKeepCustom(e.target.checked)}
                    className="h-4 w-4 accent-brand-purple"
                  />
                  Keep unmatched columns as custom fields
                </label>
              </section>

              {/* Step 3: preview */}
              <section aria-labelledby={`${uid}-preview`}>
                <h3 id={`${uid}-preview`} className="font-body text-sm font-semibold text-white mb-3">
                  Preview (first {preview.length} rows)
                </h3>
                <TableWrap label="Import preview">
                  <thead>
                    <tr>
                      {mappedHeaders.map((h) => (
                        <th key={h} scope="col" className={thClass}>
                          {mapping[h] ? TARGETS.find((t) => t.value === mapping[h])?.label : `custom.${customKey(h)}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((r, i) => (
                      <tr key={i}>
                        {mappedHeaders.map((h) => (
                          <td key={h} className={`${tdClass} whitespace-nowrap max-w-[16rem] truncate`}>
                            {r[h] || <span className="text-white/35">—</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </TableWrap>
                <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-body text-sm" aria-label="Validation summary">
                  <li className="text-emerald-300">{built.valid.length.toLocaleString()} valid emails</li>
                  <li className={built.invalid ? 'text-amber-300' : 'text-white/60'}>
                    {built.invalid.toLocaleString()} missing or invalid
                  </li>
                  {built.duplicates ? (
                    <li className="text-white/60">{built.duplicates.toLocaleString()} duplicates in file</li>
                  ) : null}
                </ul>
                {!emailHeader ? (
                  <p role="alert" className="mt-2 font-body text-sm text-red-300">
                    Choose which column holds the email address.
                  </p>
                ) : null}
              </section>

              {/* Step 4: list + import */}
              <section className="flex flex-col sm:flex-row sm:items-end gap-3">
                <div className="flex-1">
                  <Field label="List name" htmlFor={`${uid}-list`} hint="Contacts are added to this list. Existing emails are updated, not duplicated.">
                    <input
                      id={`${uid}-list`}
                      className={inputClass}
                      value={listName}
                      onChange={(e) => setListName(e.target.value)}
                      required
                    />
                  </Field>
                </div>
                <Button onClick={runImport} disabled={busy || !built.valid.length || !listName.trim() || !!result}>
                  <Upload size={16} aria-hidden />
                  {busy ? 'Importing…' : `Import ${built.valid.length.toLocaleString()} contacts`}
                </Button>
              </section>
            </>
          ) : null}

          <div aria-live="polite" className="font-body text-sm">
            {progress ? <p className="text-white/75">{progress}</p> : null}
            {error ? <p className="text-red-300">{error}</p> : null}
            {result ? (
              <div className="border border-emerald-400/30 bg-emerald-500/10 rounded-md px-4 py-3 text-emerald-200">
                <p className="font-semibold">Import finished.</p>
                <p className="mt-1">
                  {result.inserted ?? 0} added · {result.updated ?? 0} updated · {result.skippedInvalid ?? 0} skipped
                  (invalid) · {result.skippedSuppressed ?? 0} skipped (unsubscribed or bounced before)
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={close}>
                    Done
                  </Button>
                  {result.listId ? (
                    <Link
                      href={`/admin/outreach/contacts?list=${result.listId}`}
                      onClick={close}
                      className="inline-flex items-center min-h-9 px-3.5 font-body text-sm text-brand-cyan underline underline-offset-2"
                    >
                      View this list
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </dialog>
    </>
  );
}
