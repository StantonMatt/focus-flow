import { useState } from 'react';
import type { Schedule } from '../../shared/types';
import { generateId } from '../../shared/utils';
import { useTranslation } from '../../shared/i18n';

interface Props {
  schedules: Schedule[];
  onUpdate: (schedules: Schedule[]) => void;
}

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday

export default function SchedulesSection({ schedules, onUpdate }: Props) {
  const { t, getDayName } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    days: [1, 2, 3, 4, 5], // Mon-Fri
    startTime: '09:00',
    endTime: '17:00',
  });
  
  // Get schedule display name (translated if nameKey exists)
  const getScheduleName = (schedule: Schedule): string => {
    if (schedule.nameKey) {
      return t(schedule.nameKey);
    }
    return schedule.name;
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      days: [1, 2, 3, 4, 5],
      startTime: '09:00',
      endTime: '17:00',
    });
    setShowForm(false);
    setEditingId(null);
  };
  
  const handleAdd = () => {
    if (!formData.name.trim() || formData.days.length === 0) return;
    
    const newSchedule: Schedule = {
      id: generateId(),
      name: formData.name.trim(),
      days: formData.days,
      startTime: formData.startTime,
      endTime: formData.endTime,
      enabled: true,
    };
    
    onUpdate([...schedules, newSchedule]);
    resetForm();
  };
  
  const handleUpdate = () => {
    if (!editingId || !formData.name.trim()) return;
    
    onUpdate(schedules.map(s => 
      s.id === editingId 
        ? { ...s, ...formData }
        : s
    ));
    resetForm();
  };
  
  const handleToggle = (id: string) => {
    onUpdate(schedules.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };
  
  const handleDelete = (id: string) => {
    onUpdate(schedules.filter(s => s.id !== id));
  };
  
  const handleEdit = (schedule: Schedule) => {
    setFormData({
      name: getScheduleName(schedule),
      days: schedule.days,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    });
    setEditingId(schedule.id);
    setShowForm(true);
  };
  
  const toggleDay = (day: number) => {
    if (formData.days.includes(day)) {
      setFormData({ ...formData, days: formData.days.filter(d => d !== day) });
    } else {
      setFormData({ ...formData, days: [...formData.days, day].sort() });
    }
  };
  
  const formatDays = (days: number[]) => {
    if (days.length === 7) return t('schedules.everyDay');
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) return t('schedules.weekdays');
    if (days.length === 2 && days.includes(0) && days.includes(6)) return t('schedules.weekends');
    return days.map(d => getDayName(d)).join(', ');
  };
  
  return (
    <div>
      <div className="settings-section">
        <div className="settings-section-header">
          <div>
            <h2 className="settings-section-title">{t('schedules.title')}</h2>
            <p className="settings-section-desc">
              {t('schedules.description')}
            </p>
          </div>
          
          {!showForm && (
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              + {t('schedules.addSchedule')}
            </button>
          )}
        </div>
        
        {showForm && (
          <div className="schedule-form">
            <div className="form-group">
              <label className="form-label">{t('schedules.scheduleName')}</label>
              <input
                type="text"
                className="form-input"
                placeholder={t('schedules.scheduleNamePlaceholder')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">{t('schedules.days')}</label>
              <div className="day-picker">
                {ALL_DAYS.map((day) => (
                  <button
                    key={day}
                    className={`day-btn ${formData.days.includes(day) ? 'active' : ''}`}
                    onClick={() => toggleDay(day)}
                  >
                    {getDayName(day)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('schedules.startTime')}</label>
                <input
                  type="time"
                  className="form-input"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">{t('schedules.endTime')}</label>
                <input
                  type="time"
                  className="form-input"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={resetForm}>
                {t('common.cancel')}
              </button>
              <button 
                className="btn btn-primary" 
                onClick={editingId ? handleUpdate : handleAdd}
              >
                {editingId ? t('schedules.updateSchedule') : t('schedules.addSchedule')}
              </button>
            </div>
          </div>
        )}
        
        {!showForm && schedules.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <p className="empty-state-title">{t('schedules.noSchedulesYet')}</p>
            <p className="empty-state-text">
              {t('schedules.noSchedulesDesc')}
            </p>
          </div>
        )}
        
        {!showForm && schedules.length > 0 && (
          <div className="item-list">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="item-card">
                <button
                  className={`toggle ${schedule.enabled ? 'active' : ''}`}
                  onClick={() => handleToggle(schedule.id)}
                />
                
                <div className="item-card-content">
                  <div className="item-card-title">{getScheduleName(schedule)}</div>
                  <div className="item-card-subtitle">
                    {formatDays(schedule.days)} • {schedule.startTime} - {schedule.endTime}
                  </div>
                </div>
                
                <div className="item-card-actions">
                  <button 
                    className="btn-icon-sm"
                    onClick={() => handleEdit(schedule)}
                    title={t('common.edit')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button 
                    className="btn-icon-sm danger"
                    onClick={() => handleDelete(schedule.id)}
                    title={t('common.delete')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <style>{`
        .schedule-form {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          padding: 20px;
          margin-top: 16px;
        }
        
        .day-picker {
          display: flex;
          gap: 8px;
        }
        
        .day-btn {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          font-size: 0.8125rem;
          font-weight: 500;
          background: var(--bg-secondary);
          color: var(--text-muted);
          border: 1px solid var(--border-color);
          transition: all var(--transition-fast);
        }
        
        .day-btn:hover {
          border-color: var(--accent-primary);
          color: var(--text-primary);
        }
        
        .day-btn.active {
          background: var(--accent-primary);
          color: var(--bg-primary);
          border-color: var(--accent-primary);
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--border-color);
        }
      `}</style>
    </div>
  );
}
