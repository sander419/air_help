import React, { useState } from 'react';
import { 
  FileText, 
  Check, 
  ArrowLeft, 
  ShieldCheck, 
  AlertTriangle, 
  Plus, 
  ExternalLink,
  Lock
} from 'lucide-react';
import { ActiveScreen } from '../types';

interface DocumentItem {
  id: string;
  name: string;
  category: 'id' | 'travel' | 'health' | 'stay';
  checked: boolean;
  notes: string;
  required: boolean;
}

const INITIAL_DOCS: DocumentItem[] = [
  { id: 'doc-1', name: 'Загранпаспорт (оригинал)', category: 'id', checked: true, notes: 'Срок действия: до 14.12.2029 (более 3 лет запаса)', required: true },
  { id: 'doc-2', name: 'Электронный посадочный талон', category: 'travel', checked: true, notes: 'Сохранен в Apple/Google Wallet + офлайн скриншот', required: true },
  { id: 'doc-3', name: 'Шенгенская виза / Въездная виза', category: 'travel', checked: true, notes: 'Тип C (Многократная), действует до 30.11.2026', required: true },
  { id: 'doc-4', name: 'Медицинская страховка выезжающего', category: 'health', checked: true, notes: 'Покрытие 50 000€, полис сохранен в PDF офлайн', required: true },
  { id: 'doc-5', name: 'Бронь отеля / Подтверждение проживания', category: 'stay', checked: true, notes: 'Hotel Berlin Mitte, ваучер распечатан', required: false },
  { id: 'doc-6', name: 'Обратный авиабилет (для погранконтроля)', category: 'travel', checked: true, notes: 'Рейс TK 1722 через 10 дней', required: true },
];

export const DocumentsVaultView: React.FC<{ onNavigate: (screen: ActiveScreen) => void }> = ({ onNavigate }) => {
  const [docs, setDocs] = useState<DocumentItem[]>(INITIAL_DOCS);
  const [newDocName, setNewDocName] = useState('');

  const toggleCheck = (id: string) => {
    setDocs(docs.map(d => d.id === id ? { ...d, checked: !d.checked } : d));
  };

  const handleAddDoc = () => {
    if (newDocName.trim()) {
      setDocs([
        ...docs,
        {
          id: `custom-${Date.now()}`,
          name: newDocName.trim(),
          category: 'travel',
          checked: false,
          notes: 'Пользовательский документ',
          required: false
        }
      ]);
      setNewDocName('');
    }
  };

  const allChecked = docs.filter(d => d.required).every(d => d.checked);

  return (
    <div id="documents-vault-view" className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-black pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-10 h-10 border-2 border-black bg-white hover:bg-black hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block">
              ГОТОВНОСТЬ К КОНТРОЛЮ
            </span>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
              ЧЕК-ЛИСТ ДОКУМЕНТОВ
            </h1>
          </div>
        </div>

        <span className="text-xs font-mono font-bold bg-black text-white px-2.5 py-1">
          {docs.filter(d => d.checked).length}/{docs.length} ГОТОВО
        </span>
      </div>

      {/* Status Banner */}
      <div className={`p-6 border-4 space-y-2 ${
        allChecked 
          ? 'border-black bg-white text-black'
          : 'border-black bg-[#FFD700] text-black'
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-black text-white px-2 py-0.5">
            СТАТУС
          </span>
          <span className="text-xs font-mono font-bold uppercase">
            {allChecked ? 'ВСЁ ОБЯЗАТЕЛЬНОЕ ГОТОВО' : 'ТРЕБУЕТСЯ ДЕЙСТВИЕ'}
          </span>
        </div>

        <p className="text-lg sm:text-xl font-black uppercase tracking-tight leading-tight">
          {allChecked ? 'Все обязательные документы готовы к паспортному контролю' : 'Внимание: проверьте все обязательные пункты перед контролем'}
        </p>
        <p className="text-xs font-bold text-gray-800">
          Офицер пограничного контроля может запросить обратный билет, визу и страховой полис.
        </p>
      </div>

      {/* Document Checklist Items */}
      <div className="space-y-3">
        {docs.map((doc) => (
          <div
            key={doc.id}
            onClick={() => toggleCheck(doc.id)}
            className="p-5 border-2 border-black bg-white hover:bg-gray-50 transition-all cursor-pointer flex items-start justify-between gap-4 shadow-xs"
          >
            <div className="flex items-start gap-4">
              <div className={`w-7 h-7 border-2 border-black flex-shrink-0 flex items-center justify-center font-black mt-0.5 ${
                doc.checked ? 'bg-black text-white' : 'bg-white'
              }`}>
                {doc.checked && <Check className="w-4 h-4 stroke-[3]" />}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-black uppercase text-black">
                    {doc.name}
                  </h3>
                  {doc.required && (
                    <span className="text-[10px] font-mono font-black uppercase bg-black text-white px-1.5 py-0.2">
                      ОБЯЗАТЕЛЬНО
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-gray-600">{doc.notes}</p>
              </div>
            </div>

            <span className={`text-[10px] font-mono font-black uppercase px-2 py-1 border shrink-0 ${
              doc.checked ? 'bg-black text-white border-black' : 'bg-gray-100 text-black border-black'
            }`}>
              {doc.checked ? 'ПОДТВЕРЖДЕНО' : 'НЕ ПРОВЕРЕНО'}
            </span>
          </div>
        ))}
      </div>

      {/* Add Custom Document */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newDocName}
          onChange={(e) => setNewDocName(e.target.value)}
          placeholder="Добавить свой документ (например: доверенность, ваучер)..."
          className="flex-1 px-4 py-3 bg-white border-2 border-black text-sm font-bold text-black focus:outline-none min-h-[48px]"
        />
        <button
          onClick={handleAddDoc}
          className="bg-black text-white font-black text-xs uppercase px-6 py-3 border-2 border-black hover:bg-gray-800 transition-colors flex items-center gap-1 cursor-pointer min-h-[48px] shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>ДОБАВИТЬ</span>
        </button>
      </div>

    </div>
  );
};
