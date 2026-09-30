import React, { useState, useEffect } from 'react';
import { X, Landmark, CheckCircle2, Trash2 } from 'lucide-react';
import { useExamContext } from '../context/ExamContext';
import { ExamHall } from '../types';

export const HallEditModal: React.FC = () => {
  const {
    isHallModalOpen,
    setIsHallModalOpen,
    selectedHallForAction,
    setSelectedHallForAction,
    addHall,
    updateHall,
    deleteHall,
  } = useExamContext();

  const isEditing = !!selectedHallForAction;

  const [hall, setHall] = useState('');
  const [block, setBlock] = useState('A1');
  const [floor, setFloor] = useState('01');
  const [capacity, setCapacity] = useState(40);
  const [beaconId, setBeaconId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedHallForAction) {
      setHall(selectedHallForAction.hall || '');
      setBlock(selectedHallForAction.block || 'A1');
      setFloor(selectedHallForAction.floor || '01');
      setCapacity(selectedHallForAction.capacity || 40);
      setBeaconId(selectedHallForAction.beaconId || '');
      setNotes(selectedHallForAction.notes || '');
    } else {
      setHall('');
      setBlock('A1');
      setFloor('01');
      setCapacity(40);
      setBeaconId(`B-${Math.floor(1000 + Math.random() * 9000)}`);
      setNotes('Standard exam arrangement');
    }
  }, [selectedHallForAction]);

  if (!isHallModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hall) {
      alert('Hall identifier is required');
      return;
    }

    setIsSubmitting(true);
    const payload: Partial<ExamHall> = {
      hall,
      block,
      floor,
      capacity: Number(capacity),
      beaconId,
      notes,
    };

    let ok = false;
    if (isEditing && selectedHallForAction) {
      ok = await updateHall(selectedHallForAction.id, payload);
    } else {
      ok = await addHall(payload);
    }

    setIsSubmitting(false);
    if (ok) {
      setIsHallModalOpen(false);
      setSelectedHallForAction(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedHallForAction) return;
    if (window.confirm(`Are you sure you want to delete Hall ${selectedHallForAction.hall}?`)) {
      setIsSubmitting(true);
      const ok = await deleteHall(selectedHallForAction.id);
      setIsSubmitting(false);
      if (ok) {
        setIsHallModalOpen(false);
        setSelectedHallForAction(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6B1120]/10 flex items-center justify-center text-[#6B1120]">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isEditing ? 'Edit Exam Hall' : 'Add New Exam Hall'}
              </h2>
              <p className="text-xs text-slate-500">Configure room details and capacity</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsHallModalOpen(false);
              setSelectedHallForAction(null);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hall Identifier / Number *
            </label>
            <input
              type="text"
              value={hall}
              onChange={(e) => setHall(e.target.value)}
              placeholder="e.g. A1-05 or B2-01"
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Block / Building
              </label>
              <input
                type="text"
                value={block}
                onChange={(e) => setBlock(e.target.value)}
                placeholder="A1, B2..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Floor
              </label>
              <input
                type="text"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="01, 02..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Seating Capacity
              </label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                min="10"
                max="300"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Beacon ID
              </label>
              <input
                type="text"
                value={beaconId}
                onChange={(e) => setBeaconId(e.target.value)}
                placeholder="e.g. B-1042"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hall Notes / Equipment Description
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6B1120]"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsHallModalOpen(false);
                  setSelectedHallForAction(null);
                }}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#6B1120] hover:bg-[#570E1C] rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : isEditing ? 'Save Hall' : 'Create Hall'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
