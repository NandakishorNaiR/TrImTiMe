import { useState } from "react";
import { Card, CardBody } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

const ServicesManager = ({ services = [], onChange }) => {
  const [form, setForm] = useState({ name: "", price: "", duration: "" });

  const add = () => {
    if (!form.name || !form.price || !form.duration) return;
    const item = { name: form.name, price: Number(form.price), duration: Number(form.duration) };
    onChange([...services, item]);
    setForm({ name: "", price: "", duration: "" });
  };

  const remove = (index) => {
    onChange(services.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Service List */}
      {services.length > 0 && (
        <div className="space-y-2">
          <p className="text-label font-semibold text-neutral-700">Current Services</p>
          {services.map((s, i) => (
            <div key={i} className="flex items-center justify-between bg-neutral-50 p-3 rounded-lg hover:bg-neutral-100 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-900">{s.name}</p>
                <p className="text-body-small text-neutral-600">₹{s.price} • {s.duration} min</p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => remove(i)}
              >
                🗑️ Remove
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {services.length === 0 && (
        <Card className="text-center py-8">
          <CardBody>
            <p className="text-3xl mb-2">📋</p>
            <p className="text-body text-neutral-700">No services added yet</p>
            <p className="text-body-small text-neutral-600 mt-1">Add your first service below</p>
          </CardBody>
        </Card>
      )}

      {/* Add New Service Form */}
      <div className="bg-primary-50 p-4 rounded-lg border-2 border-primary-200 space-y-3">
        <p className="text-label font-semibold text-primary-900">+ Add New Service</p>

        <Input
          label="Service Name"
          placeholder="E.g., Haircut, Shave, etc."
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Price (₹)"
            type="number"
            placeholder="100"
            value={form.price}
            onChange={e => setForm({ ...form, price: e.target.value })}
          />

          <Input
            label="Duration (min)"
            type="number"
            placeholder="30"
            value={form.duration}
            onChange={e => setForm({ ...form, duration: e.target.value })}
          />
        </div>

        <Button
          variant="primary"
          fullWidth
          onClick={add}
          disabled={!form.name || !form.price || !form.duration}
        >
          ✓ Add Service
        </Button>
      </div>

      {/* Summary */}
      {services.length > 0 && (
        <div className="flex items-center gap-2 pt-2">
          <Badge variant="primary">{services.length}</Badge>
          <p className="text-body-small text-neutral-600">
            {services.length === 1 ? 'service' : 'services'} configured
          </p>
        </div>
      )}
    </div>
  );
};

export default ServicesManager;
