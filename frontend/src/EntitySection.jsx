import { useState } from 'react';
import supabase from './supabaseClient';

function EntitySection({ title, items, fields, onAdd }) {
  const emptyForm = Object.fromEntries(fields.map((f) => [f.name, '']));
  const [formValues, setFormValues] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [titleField, ...restFields] = fields;
  const photoField = fields.find((f) => f.type === 'photo');

  const handleChange = (fieldName) => (e) => {
    setFormValues({ ...formValues, [fieldName]: e.target.value });
  };

  const handlePhotoChange = (fieldName) => async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const path = `${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from('photos').upload(path, file);
    if (error) {
      alert(`Upload failed: ${error.message}`);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from('photos').getPublicUrl(path);
    setFormValues((prev) => ({ ...prev, [fieldName]: data.publicUrl }));
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const variables = {};
    fields.forEach((f) => {
      const raw = formValues[f.name];
      variables[f.name] = f.type === 'number' ? (raw ? parseFloat(raw) : null) : raw || null;
    });
    await onAdd(variables);
    setFormValues(emptyForm);
  };

  return (
    <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
      <h2 className="text-lg font-medium text-slate-800 mb-3">{title}</h2>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row flex-wrap gap-2 mb-4 items-start">
        {fields.map((f) =>
          f.type === 'photo' ? (
            <div key={f.name} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">{f.placeholder}</label>
            <input type="file" accept="image/*" onChange={handlePhotoChange(f.name)} className="text-sm" />
              {formValues[f.name] && (
                <img src={formValues[f.name]} alt="" className="w-16 h-16 object-cover rounded" />
              )}
            </div>
          ) : (
            <input
              key={f.name}
              type={f.type === 'number' ? 'number' : 'text'}
              step={f.type === 'number' ? '0.1' : undefined}
              placeholder={f.placeholder}
              value={formValues[f.name]}
              onChange={handleChange(f.name)}
              required={f.required}
              className="flex-1 min-w-[120px] rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          )
        )}
        <button
          type="submit"
          disabled={uploading}
          className="rounded-md bg-teal-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : 'Add'}
        </button>
      </form>

      <ul className="divide-y divide-slate-100">
        {items.map((item) => (
          <li key={item.id} className="py-2 text-sm text-slate-700 flex items-center gap-3">
            {photoField && item[photoField.name] && (
              <img src={item[photoField.name]} alt="" className="w-10 h-10 object-cover rounded flex-shrink-0" />
            )}
            <div>
              <span className="font-medium">{item[titleField.name]}</span>
              {restFields
                .filter((f) => f.type !== 'photo')
                .map((f) => {
                  const value = item[f.name];
                  if (value === null || value === undefined || value === '') return null;
                  if (f.type === 'link') {
                    return (
                      <a key={f.name} href={value} target="_blank" rel="noreferrer" className="ml-2 text-teal-600 underline">
                        {f.placeholder}
                      </a>
                    );
                  }
                  return <span key={f.name} className="text-slate-500"> · {f.placeholder}: {value}</span>;
                })}
            </div>
          </li>
        ))}
      </ul>
      {items.length === 0 && <p className="text-sm text-slate-400 italic">Nothing here yet.</p>}
    </section>
  );
}

export default EntitySection;