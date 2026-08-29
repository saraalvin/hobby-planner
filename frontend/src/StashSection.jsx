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
    <section>
      <h2>{title}</h2>
      <form onSubmit={handleSubmit}>
        {fields.map((f) => (
          <input
            key={f.name}
            type={f.type === 'number' ? 'number' : 'text'}
            step={f.type === 'number' ? '0.1' : undefined}
            placeholder={f.placeholder}
            value={formValues[f.name]}
            onChange={handleChange(f.name)}
            required={f.required}
          />
        ))}
        <button type="submit">Add</button>
      </form>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name}
            {item.quantity != null && ` — ${item.quantity}`}
            {item.notes && ` (${item.notes})`}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default StashSection;