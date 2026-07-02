'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Button from '../../../components/ui/Button';

export default function AdminServices() {
  const [services, setServices] = useState([
    { id: 1, title: 'Mainland Company Setup', category: 'Company Formation', status: 'Active' },
    { id: 2, title: 'UAE Golden Visa', category: 'Visa Services', status: 'Active' },
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Service Management</h1>
        <Button className="flex items-center gap-2"><Plus size={18} /> Add Service</Button>
      </div>

      <div className="glass-card p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-sm">
                <th className="pb-3 font-medium">Service Title</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map(service => (
                <tr key={service.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 text-white font-medium">{service.title}</td>
                  <td className="py-4 text-slate-300">{service.category}</td>
                  <td className="py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-400">
                      {service.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex gap-3">
                      <button className="text-teal-400 hover:text-teal-300 transition-colors"><Edit2 size={18} /></button>
                      <button className="text-red-400 hover:text-red-300 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
