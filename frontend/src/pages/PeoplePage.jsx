import { useEffect, useState } from 'react';
import { gql } from 'graphql-request';
import client from '../client';

const PEOPLE_QUERY = gql`
  query {
    people {
      id
      name
      notes
      history { id date_taken bust waist hip notes }
    }
  }
`;

const ADD_PERSON = gql`
  mutation($name: String!, $notes: String) {
    addPerson(name: $name, notes: $notes) {
      id
      name
      notes
      history { id date_taken bust waist hip notes }
    }
  }
`;

const ADD_MEASUREMENT_RECORD = gql`
  mutation($person_id: ID!, $bust: Float, $waist: Float, $hip: Float, $notes: String) {
    addMeasurementRecord(person_id: $person_id, bust: $bust, waist: $waist, hip: $hip, notes: $notes) {
      id date_taken bust waist hip notes
    }
  }
`;

function PeoplePage() {
  const [people, setPeople] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [newPersonName, setNewPersonName] = useState('');
  const [recordForm, setRecordForm] = useState({ bust: '', waist: '', hip: '', notes: '' });

  useEffect(() => {
    client.request(PEOPLE_QUERY).then((d) => setPeople(d.people));
  }, []);

  const handleAddPerson = async (e) => {
    e.preventDefault();
    if (!newPersonName) return;
    const data = await client.request(ADD_PERSON, { name: newPersonName });
    setPeople([{ ...data.addPerson, history: [] }, ...people]);
    setNewPersonName('');
  };

  const handleAddRecord = (personId) => async (e) => {
    e.preventDefault();
    const data = await client.request(ADD_MEASUREMENT_RECORD, {
      person_id: personId,
      bust: recordForm.bust ? parseFloat(recordForm.bust) : null,
      waist: recordForm.waist ? parseFloat(recordForm.waist) : null,
      hip: recordForm.hip ? parseFloat(recordForm.hip) : null,
      notes: recordForm.notes || null,
    });
    setPeople(people.map((p) => (p.id === personId ? { ...p, history: [data.addMeasurementRecord, ...p.history] } : p)));
    setRecordForm({ bust: '', waist: '', hip: '', notes: '' });
  };

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
        <h2 className="text-lg font-medium text-slate-800 mb-3">Add a person</h2>
        <form onSubmit={handleAddPerson} className="flex gap-2">
          <input
            type="text"
            placeholder="Name"
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
            className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <button type="submit" className="rounded-md bg-teal-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-teal-700">
            Add
          </button>
        </form>
      </section>

      {people.map((person) => (
        <section key={person.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <button onClick={() => setExpandedId(expandedId === person.id ? null : person.id)} className="text-lg font-medium text-slate-800">
            {person.name} {expandedId === person.id ? '▲' : '▼'}
          </button>

          {expandedId === person.id && (
            <div className="mt-4 space-y-4">
              <form onSubmit={handleAddRecord(person.id)} className="flex flex-wrap gap-2">
                <input type="number" step="0.1" placeholder="Bust (cm)" value={recordForm.bust}
                  onChange={(e) => setRecordForm({ ...recordForm, bust: e.target.value })}
                  className="w-28 rounded-md border border-slate-300 px-3 py-1.5 text-sm" />
                <input type="number" step="0.1" placeholder="Waist (cm)" value={recordForm.waist}
                  onChange={(e) => setRecordForm({ ...recordForm, waist: e.target.value })}
                  className="w-28 rounded-md border border-slate-300 px-3 py-1.5 text-sm" />
                <input type="number" step="0.1" placeholder="Hip (cm)" value={recordForm.hip}
                  onChange={(e) => setRecordForm({ ...recordForm, hip: e.target.value })}
                  className="w-28 rounded-md border border-slate-300 px-3 py-1.5 text-sm" />
                <input type="text" placeholder="Notes" value={recordForm.notes}
                  onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                  className="flex-1 min-w-[120px] rounded-md border border-slate-300 px-3 py-1.5 text-sm" />
                <button type="submit" className="rounded-md bg-teal-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-teal-700">
                  Add record
                </button>
              </form>

              <ul className="divide-y divide-slate-100">
                {person.history.map((h) => (
                  <li key={h.id} className="py-2 text-sm text-slate-700">
                    <span className="text-slate-400">{h.date_taken}</span>
                    {h.bust != null && <span> · Bust: {h.bust}</span>}
                    {h.waist != null && <span> · Waist: {h.waist}</span>}
                    {h.hip != null && <span> · Hip: {h.hip}</span>}
                    {h.notes && <span className="text-slate-400"> ({h.notes})</span>}
                  </li>
                ))}
                {person.history.length === 0 && <p className="text-sm text-slate-400 italic">No measurements recorded yet.</p>}
              </ul>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

export default PeoplePage;