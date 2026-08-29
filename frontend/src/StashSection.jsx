import { useState } from 'react';

function StashSection({ title, items, fields, onAdd }) {
  const emptyForm = Object.fromEntries(fields.map((f) => [f.name, '']));
  const [formValues, setFormValues] = useState(emptyForm);

  const handleChange = (fieldName) => (e) => {
    setFormValues({ ...formValues, [fieldName]: e.target.value });
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

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row flex-wrap gap-2 mb-4">
        {fields.map((f) => (
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
        ))}
        <button
          type="submit"
          className="rounded-md bg-teal-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-teal-700"
        >
          Add
        </button>
      </form>

      <ul className="divide-y divide-slate-100">
        {items.map((item) => (
          <li key={item.id} className="py-2 text-sm text-slate-700">
            <span className="font-medium">{item.name}</span>
            {item.quantity != null && <span className="text-slate-500"> — {item.quantity}</span>}
            {item.notes && <span className="text-slate-400"> ({item.notes})</span>}
          </li>
        ))}
      </ul>
      {items.length === 0 && <p className="text-sm text-slate-400 italic">Nothing here yet.</p>}
    </section>
  );
}

export default StashSection;