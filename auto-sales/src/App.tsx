import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  Phone, 
  Upload, 
  Play, 
  Square, 
  Clock, 
  CheckCircle2, 
  Circle, 
  PhoneCall,
  Trash2,
  Settings2,
  FileSpreadsheet,
  AlertCircle,
  StickyNote,
  Calendar,
  Check,
  ListFilter,
  Bell,
  Languages,
  Download,
  FileUp,
  X,
  Mic,
  MicOff,
  ThumbsUp,
  ThumbsDown,
  PhoneOff,
  History,
  ChevronDown,
  ChevronRight,
  FolderArchive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

type CallStatus = 'PENDING' | 'CALLING' | 'COMPLETED' | 'SKIPPED';
type CallOutcome = 'INTERESTED' | 'NOT_INTERESTED' | 'NO_ANSWER' | 'POSTPONED' | 'NONE';

interface Contact {
  id: string;
  name: string;
  phone: string;
  status: CallStatus;
  outcome: CallOutcome;
  notes?: string;
  reminderTime?: string;
  notified?: boolean;
}

interface ImportGroup {
  id: string;
  filename: string;
  date: string;
  contacts: Contact[];
  isExpanded: boolean;
}

const translations = {
  en: {
    title: "Auto Sales",
    subtitle: "Automated call sequence manager for Excel/CSV lists.",
    import: "Import List",
    reminders: "Reminders",
    settings: "Settings",
    config: "Configuration",
    delay: "Delay between calls (seconds)",
    opMode: "Operation Mode",
    simulation: "Simulation",
    manual: "Manual (tel:)",
    start: "Start Sequence",
    stop: "Stop Sequence",
    stats: "Statistics",
    completed: "Completed",
    remaining: "Remaining",
    contactList: "Contact List",
    remindersList: "Reminders & Deferred Calls",
    noContacts: "Import an Excel or CSV file to get started",
    noReminders: "No reminders set yet",
    formatHint: "Format: Column A (Name), Column B (Phone)",
    notes: "Notes",
    notesPlaceholder: "Enter call notes...",
    setReminder: "Set Follow-up Time",
    doneNext: "Save & Next",
    remindAt: "Follow-up at",
    language: "Language",
    backup: "Backup Data",
    restore: "Restore Backup",
    close: "Close",
    arabic: "Arabic",
    english: "English",
    total: "total",
    outcome: "Outcome",
    interested: "Interested",
    notInterested: "Not Interested",
    noAnswer: "No Answer",
    postponed: "Postponed",
    voiceNote: "Voice to Text",
    listening: "Listening...",
    errorFile: "Failed to parse file. Please use a valid Excel or CSV file.",
    errorNoContacts: "No valid contacts found. Ensure column A is Name and column B is Phone.",
    backupSuccess: "Backup downloaded successfully.",
    restoreSuccess: "Backup restored successfully.",
    restoreError: "Failed to restore backup. Invalid file format.",
    archive: "Archive",
    importedOn: "Imported on",
    noImports: "No imports yet",
    resetApp: "Reset App",
    resetConfirm: "Are you sure you want to clear all data? This cannot be undone."
    ,
    profileTitle: "Profile",
    profileNamePlaceholder: "Enter your name...",
    profileUploadPhoto: "Upload your photo",
    profileChangePhoto: "Change Photo",
    profileRemovePhoto: "Remove",
    profileSectionSubtitle: "Write your name here and put your photo here"
    ,
    theme: "Theme",
    light: "Light",
    dark: "Dark"
  },
  ar: {
    title: "أوتو سيلز",
    subtitle: "مدير تسلسل المكالمات الآلي لقوائم Excel/CSV.",
    import: "استيراد القائمة",
    reminders: "التنبيهات",
    settings: "الإعدادات",
    config: "التكوين",
    delay: "التأخير بين المكالمات (بالثواني)",
    opMode: "وضع التشغيل",
    simulation: "محاكاة",
    manual: "يدوي (tel:)",
    start: "بدء التسلسل",
    stop: "إيقاف التسلسل",
    stats: "الإحصائيات",
    completed: "مكتمل",
    remaining: "متبقي",
    contactList: "قائمة الجهات",
    remindersList: "التنبيهات والمكالمات المؤجلة",
    noContacts: "قم باستيراد ملف Excel أو CSV للبدء",
    noReminders: "لا توجد تنبيهات محددة بعد",
    formatHint: "التنسيق: العمود أ (الاسم)، العمود ب (الهاتف)",
    notes: "ملاحظات",
    notesPlaceholder: "أدخل ملاحظات المكالمة...",
    setReminder: "تحديد موعد المتابعة",
    doneNext: "حفظ والتالي",
    remindAt: "متابعة في",
    language: "اللغة",
    backup: "نسخة احتياطية",
    restore: "استعادة النسخة",
    close: "إغلاق",
    arabic: "العربية",
    english: "الإنجليزية",
    total: "إجمالي",
    outcome: "النتيجة",
    interested: "مهتم",
    notInterested: "غير مهتم",
    noAnswer: "لم يرد",
    postponed: "تأجيل",
    voiceNote: "كتابة صوتية",
    listening: "جاري الاستماع...",
    errorFile: "فشل في تحليل الملف. يرجى استخدام ملف Excel أو CSV صالح.",
    errorNoContacts: "لم يتم العثور على جهات اتصال صالحة. تأكد من أن العمود أ هو الاسم والعمود ب هو الهاتف.",
    backupSuccess: "تم تحميل النسخة الاحتياطية بنجاح.",
    restoreSuccess: "تم استعادة النسخة الاحتياطية بنجاح.",
    restoreError: "فشل استعادة النسخة الاحتياطية. تنسيق ملف غير صالح.",
    archive: "الأرشيف",
    importedOn: "تم الاستيراد في",
    noImports: "لا توجد ملفات مستوردة بعد",
    resetApp: "إعادة ضبط التطبيق",
    resetConfirm: "هل أنت متأكد من مسح جميع البيانات؟ لا يمكن التراجع عن هذه الخطوة."
    ,
    profileTitle: "الملف الشخصي",
    profileNamePlaceholder: "اكتب اسمك هنا",
    profileUploadPhoto: "ضع صورتك هنا",
    profileChangePhoto: "تغيير الصورة",
    profileRemovePhoto: "إزالة",
    profileSectionSubtitle: "اكتب اسمك هنا وضع صورتك هنا"
    ,
    theme: "المظهر",
    light: "فاتح",
    dark: "داكن"
  }
};

const ContactItem: React.FC<{ contact: Contact, index: number, t: any, isRTL: boolean, language: string }> = ({ contact, index, t, isRTL, language }) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ delay: Math.min(index * 0.05, 0.5) }}
    className={cn(
      "group p-4 rounded-xl border transition-all flex flex-col gap-3",
      contact.status === 'CALLING' 
        ? "bg-blue-600/10 border-blue-500/50 ring-1 ring-blue-500/20" 
        : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
    )}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
          contact.status === 'COMPLETED' ? "bg-emerald-500/20 text-emerald-400" :
          contact.status === 'CALLING' ? "bg-blue-500/20 text-blue-400 animate-pulse" :
          "bg-zinc-800 text-zinc-500"
        )}>
          {contact.status === 'COMPLETED' ? <CheckCircle2 className="w-5 h-5" /> :
           contact.status === 'CALLING' ? <Phone className="w-5 h-5" /> :
           <Circle className="w-5 h-5" />}
        </div>
        <div>
          <h3 className="font-medium text-zinc-200">{contact.name}</h3>
          <p className="text-sm text-zinc-500 font-mono">{contact.phone}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {contact.outcome !== 'NONE' && (
          <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter",
            contact.outcome === 'INTERESTED' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
            contact.outcome === 'NOT_INTERESTED' ? "bg-red-500/10 text-red-400 border border-red-500/20" :
            contact.outcome === 'NO_ANSWER' ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
            "bg-blue-500/10 text-blue-400 border border-blue-500/20"
          )}>
            {t[contact.outcome.toLowerCase() as keyof typeof t]}
          </span>
        )}
        <span className={cn(
          "text-[10px] font-bold px-2 py-1 rounded uppercase tracking-tighter",
          contact.status === 'COMPLETED' ? "text-emerald-500" :
          contact.status === 'CALLING' ? "text-blue-400" :
          "text-zinc-600"
        )}>
          {contact.status}
        </span>
      </div>
    </div>

    {(contact.notes || contact.reminderTime) && (
      <div className={cn("space-y-2", isRTL ? "pr-14" : "pl-14")}>
        {contact.notes && (
          <div className="flex items-start gap-2 text-xs text-zinc-400 bg-black/20 p-2 rounded-lg border border-white/5">
            <StickyNote className="w-3 h-3 mt-0.5 shrink-0 text-amber-500/50" />
            <p className="italic">{contact.notes}</p>
          </div>
        )}
        {contact.reminderTime && (
          <div className="flex items-center gap-2 text-xs text-amber-400/80 font-medium">
            <Calendar className="w-3 h-3" />
            <span>{t.remindAt}: {new Date(contact.reminderTime).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
          </div>
        )}
      </div>
    )}
  </motion.div>
);

export default function App() {
  const [importGroups, setImportGroups] = useState<ImportGroup[]>(() => {
    const saved = localStorage.getItem('auto_sales_groups');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCalling, setIsCalling] = useState(false);
  const [delaySeconds, setDelaySeconds] = useState(() => {
    const saved = localStorage.getItem('auto_sales_delay');
    return saved ? parseInt(saved) : 5;
  });
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'SIMULATION' | 'MANUAL'>(() => {
    const saved = localStorage.getItem('auto_sales_mode');
    return saved as 'SIMULATION' | 'MANUAL' || 'SIMULATION';
  });
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [activeNote, setActiveNote] = useState('');
  const [activeOutcome, setActiveOutcome] = useState<CallOutcome>('NONE');
  const [isListening, setIsListening] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [showReminders, setShowReminders] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ar'>(() => {
    const saved = localStorage.getItem('auto_sales_lang');
    return (saved as 'en' | 'ar') || 'ar';
  });
  const [showSettings, setShowSettings] = useState(false);
  const [userName, setUserName] = useState(() => {
    const saved = localStorage.getItem('auto_sales_user_name');
    return saved || '';
  });
  const [userPhoto, setUserPhoto] = useState<string | null>(() => {
    const saved = localStorage.getItem('auto_sales_user_photo');
    return saved || null;
  });
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('auto_sales_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('auto_sales_groups', JSON.stringify(importGroups));
  }, [importGroups]);

  useEffect(() => {
    localStorage.setItem('auto_sales_user_name', userName);
  }, [userName]);

  useEffect(() => {
    if (userPhoto) localStorage.setItem('auto_sales_user_photo', userPhoto);
    else localStorage.removeItem('auto_sales_user_photo');
  }, [userPhoto]);

  useEffect(() => {
    localStorage.setItem('auto_sales_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('auto_sales_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('auto_sales_delay', delaySeconds.toString());
  }, [delaySeconds]);

  useEffect(() => {
    localStorage.setItem('auto_sales_mode', mode);
  }, [mode]);
  
  const t = translations[language];
  const isRTL = language === 'ar';
  
  const allContacts = useMemo(() => importGroups.flatMap(g => g.contacts), [importGroups]);
  const reminders = useMemo(() => allContacts.filter(c => c.reminderTime), [allContacts]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [showProfileSettings, setShowProfileSettings] = useState(false);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Check for due reminders
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      let hasUpdates = false;
      const updatedGroups = importGroups.map(group => {
        let groupUpdated = false;
        const updatedContacts = group.contacts.map(contact => {
          if (contact.reminderTime && !contact.notified) {
            const reminderTime = new Date(contact.reminderTime);
            if (reminderTime <= now && contact.status !== 'COMPLETED') {
              // Trigger Notification
              if (Notification.permission === "granted") {
                new Notification(`${isRTL ? 'تنبيه' : 'Reminder'}: Call ${contact.name}`, {
                  body: `${isRTL ? 'مكالمة مجدولة لـ' : 'Scheduled call for'} ${contact.phone}`,
                  icon: "/favicon.svg"
                });
              }
              groupUpdated = true;
              hasUpdates = true;
              return { ...contact, notified: true };
            }
          }
          return contact;
        });
        return groupUpdated ? { ...group, contacts: updatedContacts } : group;
      });

      if (hasUpdates) {
        setImportGroups(updatedGroups);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [importGroups, isRTL]);

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        if (!data) return;
        const wb = XLSX.read(data, { type: 'array' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        const importedContacts: Contact[] = rows
          .slice(1) // Skip header
          .filter(row => row[1]) // Must have phone
          .map((row) => ({
            id: crypto.randomUUID(),
            name: String(row[0] || 'Unknown'),
            phone: String(row[1]),
            status: 'PENDING',
            outcome: 'NONE',
            notified: false
          }));

        if (importedContacts.length === 0) {
          setError(t.errorNoContacts);
          return;
        }

        const newGroup: ImportGroup = {
          id: crypto.randomUUID(),
          filename: file.name,
          date: new Date().toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US'),
          contacts: importedContacts,
          isExpanded: true
        };

        setImportGroups(prev => [...prev, newGroup]);
        setError(null);
      } catch (err) {
        setError(t.errorFile);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleBackup = () => {
    const dataStr = JSON.stringify({
      importGroups,
      delaySeconds,
      mode,
      language,
      profile: {
        name: userName,
        photo: userPhoto
      }
    }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `autocall-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    setError(t.backupSuccess);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.importGroups) {
          setImportGroups(data.importGroups);
          if (data.delaySeconds) setDelaySeconds(data.delaySeconds);
          if (data.mode) setMode(data.mode);
          if (data.language) setLanguage(data.language);
          if (data.profile) {
            setUserName(data.profile.name || '');
            setUserPhoto(data.profile.photo || null);
          }
          setError(t.restoreSuccess);
        } else if (data.contacts) {
          // Legacy support for single list backups
          const legacyGroup: ImportGroup = {
            id: crypto.randomUUID(),
            filename: "Restored Backup",
            date: new Date().toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US'),
            contacts: data.contacts,
            isExpanded: true
          };
          setImportGroups([legacyGroup]);
          setError(t.restoreSuccess);
        } else {
          setError(t.restoreError);
        }
      } catch (err) {
        setError(t.restoreError);
      }
    };
    reader.readAsText(file);
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result as string | null;
      if (result) setUserPhoto(result);
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    if (window.confirm(t.resetConfirm)) {
      const keys = ['auto_sales_groups', 'auto_sales_lang', 'auto_sales_delay', 'auto_sales_mode'];
      keys.forEach(k => localStorage.removeItem(k));
      window.location.reload();
    }
  };

  const startCalling = () => {
    const hasPending = importGroups.some(g => g.contacts.some(c => c.status === 'PENDING'));
    if (!hasPending) return;
    const begin = async () => {
      // If on native Android, try to request CALL_PHONE permission via Capacitor/bridge before starting
      if (mode === 'MANUAL') {
        const granted = await ensureCallPermission();
        if (!granted) {
          setError(language === 'ar' ? 'صلاحية إجراء المكالمات مطلوبة لتشغيل الوضع اليدوي.' : 'Call permission is required to start manual calling.');
          return;
        }
      }
      setIsCalling(true);
      setError(null);
    };
    void begin();
  };

  const stopCalling = () => {
    setIsCalling(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveContactId(null);
  };

  const clearList = () => {
    stopCalling();
    setImportGroups([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateContactStatus = (id: string, status: CallStatus, extra?: Partial<Contact>) => {
    setImportGroups(prev => prev.map(group => ({
      ...group,
      contacts: group.contacts.map(c => c.id === id ? { 
        ...c, 
        status, 
        ...extra,
        // Reset notified if a new reminder time is set
        notified: extra?.reminderTime ? false : c.notified 
      } : c)
    })));
  };

  const handleFinishNotes = () => {
    if (activeContactId !== null) {
      updateContactStatus(activeContactId, 'COMPLETED', { 
        notes: activeNote, 
        outcome: activeOutcome,
        reminderTime: reminderDate || undefined 
      });
      setIsEditingNotes(false);
      setActiveNote('');
      setActiveOutcome('NONE');
      setReminderDate('');
    }
  };

  const toggleListening = () => {
    if (!navigator.onLine) {
      setError(language === 'ar' ? 'التحويل من صوت إلى نص يتطلب اتصالاً بالإنترنت.' : 'Voice-to-text requires an internet connection.');
      return;
    }
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError("Speech recognition not supported in this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'ar' ? 'ar-SA' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setActiveNote(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.start();
  };

  const ensureCallPermission = async (): Promise<boolean> => {
    // Web browsers don't expose CALL_PHONE permission; this hook attempts
    // to call native bridges (Capacitor / Android) when running as an APK.
    try {
      const anyWin = window as any;
      if (anyWin.Capacitor && anyWin.Capacitor.isNativePlatform && anyWin.Capacitor.isNativePlatform()) {
        const Cap = anyWin.Capacitor;
        // Try common plugin shapes — best-effort: many projects will need a native plugin.
        const perms = Cap.Plugins?.AndroidPermissions || Cap.Plugins?.Permissions || Cap.Plugins?.AppPermissions;
        if (perms && perms.requestPermissions) {
          const res = await perms.requestPermissions({ permissions: ['android.permission.CALL_PHONE'] });
          // Some implementations return an object with granted boolean or permissions map
          if (res && (res.granted === true || res.permissions)) return true;
        }

        // Fallback: try plugin method named requestPermission
        if (perms && perms.requestPermission) {
          const r = await perms.requestPermission('android.permission.CALL_PHONE');
          if (r && (r.granted === true || r === 'granted')) return true;
        }

        // If no plugin, try to call a global Android bridge method if provided
        if (anyWin.Android && anyWin.Android.requestCallPermission) {
          const ok = await anyWin.Android.requestCallPermission();
          return !!ok;
        }

        // If we can't detect an explicit denial, let the caller decide — return true to allow dialing
        return true;
      }
    } catch (e) {
      console.warn('ensureCallPermission error', e);
    }
    // Non-native (web) environment: cannot request CALL_PHONE; return true so tel: links work.
    return true;
  };

  // Calling Loop Logic
  useEffect(() => {
    if (!isCalling || isEditingNotes) return;

    const runLoop = async () => {
      const allContacts = importGroups.flatMap(g => g.contacts);
      // Find first pending contact
      const nextIndex = allContacts.findIndex(c => c.status === 'PENDING');
      
      if (nextIndex === -1) {
        setIsCalling(false);
        setActiveContactId(null);
        return;
      }

      const contact = allContacts[nextIndex];
      setActiveContactId(contact.id);

      // Step 1: Mark as Calling
      updateContactStatus(contact.id, 'CALLING');

      if (mode === 'MANUAL') {
        window.location.href = `tel:${contact.phone}`;
      }
      
      // Automatically open notes field
      setIsEditingNotes(true);
      setActiveNote(contact.notes || '');
      setReminderDate(contact.reminderTime || '');
    };

    runLoop();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isCalling, importGroups, isEditingNotes, mode]);

  return (
    <div className={cn(
      "min-h-screen p-3 md:p-8 max-w-4xl mx-auto",
      theme === 'light' ? 'bg-white text-zinc-900' : 'bg-zinc-950 text-zinc-100',
      isRTL && "font-sans"
    )} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
            {userPhoto ? (
              <img src={userPhoto} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="text-blue-400 font-bold">{(userName || t.title).split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()}</div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-blue-500 flex items-center gap-2">
              <PhoneCall className="w-8 h-8" />
              {t.title}
            </h1>
            <p className="text-zinc-400 mt-1">{userName ? `${userName} • ${t.subtitle}` : t.subtitle}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
          <button 
            onClick={() => setShowReminders(!showReminders)}
            className={cn(
              "btn-secondary h-9 px-2 text-[11px] flex-1 min-w-0",
              showReminders && "bg-blue-600/20 border-blue-500 text-blue-400"
            )}
          >
            <Bell className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t.reminders}</span>
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary h-9 px-2 text-[11px] flex-1 min-w-0"
          >
            <Upload className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t.import}</span>
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="btn-secondary h-9 px-2 text-[11px] flex-1 min-w-0"
          >
            <Settings2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t.settings}</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />
        </div>
        {importGroups.length > 0 && (
          <div className="flex justify-end md:justify-start">
            <button onClick={clearList} className="p-2 text-zinc-500 hover:text-red-400 transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </header>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass w-full max-w-md rounded-2xl p-6 relative overflow-hidden"
            >
              <button 
                onClick={() => setShowSettings(false)}
                className="absolute top-4 right-4 p-1 text-zinc-500 hover:text-zinc-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Settings2 className="w-6 h-6 text-blue-400" />
                {t.settings}
              </h2>

              <div className="space-y-6">
                {/* Language Selection */}
                <div>
                  <label className="text-sm text-zinc-400 block mb-3 flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    {t.language}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setLanguage('en')}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                        language === 'en' ? "bg-blue-600/20 border-blue-500 text-blue-400" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                      )}
                    >
                      {t.english}
                    </button>
                    <button 
                      onClick={() => setLanguage('ar')}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                        language === 'ar' ? "bg-blue-600/20 border-blue-500 text-blue-400" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                      )}
                    >
                      {t.arabic}
                    </button>
                  </div>
                </div>

                {/* Theme Selection */}
                <div>
                  <label className="text-sm text-zinc-400 block mb-3 flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    {t.theme}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setTheme('light')}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                        theme === 'light' ? "bg-blue-600/20 border-blue-500 text-blue-400" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                      )}
                    >
                      {t.light}
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                        theme === 'dark' ? "bg-blue-600/20 border-blue-500 text-blue-400" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                      )}
                    >
                      {t.dark}
                    </button>
                  </div>
                </div>

                {/* Profile */}
                <div className="pt-2 border-t border-white/10">
                  <button
                    onClick={() => setShowProfileSettings(!showProfileSettings)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-zinc-900/60 border border-zinc-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                        {userPhoto ? <img src={userPhoto} className="w-full h-full object-cover" /> : <div className="text-sm text-zinc-400">{(userName||'U').slice(0,2).toUpperCase()}</div>}
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-zinc-200">{userName || t.profileTitle}</div>
                        <div className="text-xs text-zinc-500">{t.profileSectionSubtitle}</div>
                      </div>
                    </div>
                    <div className="text-zinc-400">{showProfileSettings ? '▲' : '▼'}</div>
                  </button>

                  {showProfileSettings && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <label className="text-sm text-zinc-400 block mb-2">{t.profileTitle}</label>
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder={t.profileNamePlaceholder}
                          className="input-field w-full"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-zinc-400 block mb-2">{t.profileUploadPhoto}</label>
                        <div className="flex items-center gap-2">
                          <button onClick={() => profilePhotoInputRef.current?.click()} className="btn-secondary">{userPhoto ? t.profileChangePhoto : t.profileUploadPhoto}</button>
                          {userPhoto && <button onClick={() => setUserPhoto(null)} className="btn-secondary">{t.profileRemovePhoto}</button>}
                        </div>
                        <input type="file" ref={profilePhotoInputRef} accept="image/*" onChange={handleProfilePhotoChange} className="hidden" />
                        {userPhoto && <div className="mt-2 w-24 h-24 rounded-lg overflow-hidden"><img src={userPhoto} className="w-full h-full object-cover" /></div>}
                      </div>
                    </div>
                  )}
                </div>

                {/* Backup & Restore */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <button 
                    onClick={handleBackup}
                    className="btn-secondary w-full justify-start"
                  >
                    <Download className="w-4 h-4" />
                    {t.backup}
                  </button>
                  <button 
                    onClick={() => backupInputRef.current?.click()}
                    className="btn-secondary w-full justify-start"
                  >
                    <FileUp className="w-4 h-4" />
                    {t.restore}
                  </button>
                  <button 
                    onClick={handleReset}
                    className="btn-secondary w-full justify-start text-red-400 hover:bg-red-500/10 border-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t.resetApp}
                  </button>
                  <input 
                    type="file" 
                    ref={backupInputRef}
                    onChange={handleRestore}
                    accept=".json"
                    className="hidden"
                  />
                </div>

                <button 
                  onClick={() => setShowSettings(false)}
                  className="btn-primary w-full mt-4"
                >
                  {t.close}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3 text-blue-400"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Active Call Section */}
          <AnimatePresence>
            {isEditingNotes && activeContactId !== null && (
              <motion.section 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass rounded-2xl p-6 border-blue-500/30 bg-blue-600/5 ring-1 ring-blue-500/20"
              >
                {(() => {
                  const contact = allContacts.find(c => c.id === activeContactId);
                  if (!contact) return null;
                  return (
                    <>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center animate-pulse">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-blue-400">{contact.name}</h3>
                          <p className="text-xs text-zinc-400 font-mono">{contact.phone}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-2 block">{t.outcome}</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button 
                              onClick={() => setActiveOutcome('INTERESTED')}
                              className={cn(
                                "flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-medium border transition-all",
                                activeOutcome === 'INTERESTED' ? "bg-emerald-600/20 border-emerald-500 text-emerald-400" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                              )}
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              {t.interested}
                            </button>
                            <button 
                              onClick={() => setActiveOutcome('NOT_INTERESTED')}
                              className={cn(
                                "flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-medium border transition-all",
                                activeOutcome === 'NOT_INTERESTED' ? "bg-red-600/20 border-red-500 text-red-400" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                              )}
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                              {t.notInterested}
                            </button>
                            <button 
                              onClick={() => setActiveOutcome('NO_ANSWER')}
                              className={cn(
                                "flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-medium border transition-all",
                                activeOutcome === 'NO_ANSWER' ? "bg-amber-600/20 border-amber-500 text-amber-400" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                              )}
                            >
                              <PhoneOff className="w-3.5 h-3.5" />
                              {t.noAnswer}
                            </button>
                            <button 
                              onClick={() => setActiveOutcome('POSTPONED')}
                              className={cn(
                                "flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-medium border transition-all",
                                activeOutcome === 'POSTPONED' ? "bg-blue-600/20 border-blue-500 text-blue-400" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                              )}
                            >
                              <History className="w-3.5 h-3.5" />
                              {t.postponed}
                            </button>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs text-zinc-400 uppercase tracking-wider font-semibold block">{t.notes}</label>
                            <button 
                              onClick={toggleListening}
                              className={cn(
                                "flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition-all",
                                isListening ? "bg-red-500/20 border-red-500 text-red-400 animate-pulse" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200"
                              )}
                            >
                              {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                              {isListening ? t.listening : t.voiceNote}
                            </button>
                          </div>
                          <textarea 
                            value={activeNote}
                            onChange={(e) => setActiveNote(e.target.value)}
                            placeholder={t.notesPlaceholder}
                            className="input-field w-full h-20 resize-none text-sm"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-1 block">{t.setReminder}</label>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-zinc-500" />
                            <input 
                              type="datetime-local" 
                              value={reminderDate}
                              onChange={(e) => setReminderDate(e.target.value)}
                              className="input-field w-full text-xs"
                            />
                          </div>
                        </div>

                        <button 
                          onClick={handleFinishNotes}
                          className="btn-primary w-full py-2 bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20"
                        >
                          <Check className="w-4 h-4" />
                          {t.doneNext}
                        </button>
                      </div>
                    </>
                  );
                })()}
              </motion.section>
            )}
          </AnimatePresence>

          <section className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-blue-400" />
              {t.config}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-zinc-400 block mb-2">{t.delay}</label>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-zinc-500" />
                  <input 
                    type="number" 
                    value={delaySeconds}
                    onChange={(e) => setDelaySeconds(Math.max(1, parseInt(e.target.value) || 1))}
                    className="input-field w-full"
                    min="1"
                    disabled={isCalling}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-zinc-400 block mb-2">{t.opMode}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setMode('SIMULATION')}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                      mode === 'SIMULATION' ? "bg-blue-600/20 border-blue-500 text-blue-400" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                    )}
                    disabled={isCalling}
                  >
                    {t.simulation}
                  </button>
                  <button 
                    onClick={() => setMode('MANUAL')}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                      mode === 'MANUAL' ? "bg-blue-600/20 border-blue-500 text-blue-400" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                    )}
                    disabled={isCalling}
                  >
                    {t.manual}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {!isCalling ? (
                <button 
                  onClick={startCalling}
                  disabled={allContacts.length === 0}
                  className="btn-primary w-full py-3 text-lg shadow-lg shadow-blue-600/20"
                >
                  <Play className="w-5 h-5 fill-current" />
                  {t.start}
                </button>
              ) : (
                <button 
                  onClick={stopCalling}
                  className="btn-secondary w-full py-3 text-lg border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <Square className="w-5 h-5 fill-current" />
                  {t.stop}
                </button>
              )}
            </div>
          </section>

          {importGroups.length > 0 && (
            <section className="glass rounded-2xl p-6">
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">{t.stats}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                  <div className="text-xl font-bold text-emerald-400">{allContacts.filter(c => c.outcome === 'INTERESTED').length}</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-tighter">{t.interested}</div>
                </div>
                <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                  <div className="text-xl font-bold text-red-400">{allContacts.filter(c => c.outcome === 'NOT_INTERESTED').length}</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-tighter">{t.notInterested}</div>
                </div>
                <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                  <div className="text-xl font-bold text-amber-400">{allContacts.filter(c => c.outcome === 'NO_ANSWER').length}</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-tighter">{t.noAnswer}</div>
                </div>
                <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                  <div className="text-xl font-bold text-blue-400">{allContacts.filter(c => c.outcome === 'POSTPONED').length}</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-tighter">{t.postponed}</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-zinc-300">{allContacts.filter(c => c.status === 'PENDING').length}</span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">{t.remaining}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-zinc-300">{allContacts.length}</span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">{t.total}</span>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* List Panel */}
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl overflow-hidden flex flex-col h-[700px]">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <h2 className="font-semibold flex items-center gap-2">
                {showReminders ? (
                  <Bell className="w-5 h-5 text-amber-400" />
                ) : (
                  <FolderArchive className="w-5 h-5 text-blue-400" />
                )}
                {showReminders ? t.remindersList : t.archive}
                <span className="text-xs font-normal text-zinc-500 ml-2">
                  ({(showReminders ? reminders : allContacts).length} {t.total})
                </span>
              </h2>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowReminders(false)}
                  className={cn(
                    "p-1.5 rounded-md transition-all",
                    !showReminders ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  <ListFilter className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {showReminders ? (
                  reminders.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4"
                    >
                      <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center">
                        <Bell className="w-8 h-8" />
                      </div>
                      <p>{t.noReminders}</p>
                    </motion.div>
                  ) : (
                    reminders.map((contact, index) => (
                      <ContactItem key={contact.id} contact={contact} index={index} t={t} isRTL={isRTL} language={language} />
                    ))
                  )
                ) : importGroups.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center">
                      <Upload className="w-8 h-8" />
                    </div>
                    <p>{t.noImports}</p>
                    <p className="text-xs text-zinc-600">{t.formatHint}</p>
                  </motion.div>
                ) : (
                  importGroups.map((group) => (
                    <div key={group.id} className="space-y-2">
                      <button 
                        onClick={() => setImportGroups(prev => prev.map(g => g.id === group.id ? { ...g, isExpanded: !g.isExpanded } : g))}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                            <FileSpreadsheet className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-sm font-bold text-zinc-200 group-hover:text-blue-400 transition-colors">{group.filename}</h3>
                            <p className="text-[10px] text-zinc-500">{t.importedOn}: {group.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                            {group.contacts.filter(c => c.status === 'COMPLETED').length}/{group.contacts.length}
                          </span>
                          {group.isExpanded ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
                        </div>
                      </button>
                      
                      <AnimatePresence>
                        {group.isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden space-y-2 px-1"
                          >
                            {group.contacts.map((contact, index) => (
                              <ContactItem key={contact.id} contact={contact} index={index} t={t} isRTL={isRTL} language={language} />
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
}
