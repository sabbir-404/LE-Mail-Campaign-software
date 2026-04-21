import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => ipcRenderer.invoke('ping'),

  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.send('save-settings', settings),

  // Designs
  getDesigns: () => ipcRenderer.invoke('get-designs'),
  getDesign: (id: number) => ipcRenderer.invoke('get-design', id),
  saveDesign: (design: any) => ipcRenderer.send('save-design', design),
  updateDesign: (id: number, design: any) => ipcRenderer.send('update-design', id, design),
  deleteDesign: (id: number) => ipcRenderer.send('delete-design', id),

  // History
  getHistory: () => ipcRenderer.invoke('get-history'),
  getHistoryRecords: (id: number) => ipcRenderer.invoke('get-history-records', id),

  // Dashboard
  getDashboardStats: () => ipcRenderer.invoke('get-dashboard-stats'),
  fetchAnalytics: () => ipcRenderer.invoke('fetch-analytics'),

  // Contact Lists
  getContactLists: () => ipcRenderer.invoke('get-contact-lists'),
  getContacts: (listId: number) => ipcRenderer.invoke('get-contacts', listId),
  importContactList: (payload: any) => ipcRenderer.invoke('import-contact-list', payload),
  deleteContactList: (id: number) => ipcRenderer.invoke('delete-contact-list', id),
  addContact: (data: any) => ipcRenderer.invoke('add-contact', data),
  updateContact: (data: any) => ipcRenderer.invoke('update-contact', data),
  deleteContact: (data: any) => ipcRenderer.invoke('delete-contact', data),
  createBlankList: (data: any) => ipcRenderer.invoke('create-blank-list', data),

  // Campaign
  startCampaign: (payload: any) => ipcRenderer.send('start-campaign', payload),
  stopCampaign: () => ipcRenderer.send('stop-campaign'),
  onCampaignLog: (callback: (data: any) => void) => {
    ipcRenderer.removeAllListeners('campaign-log');
    ipcRenderer.on('campaign-log', (_event, value) => callback(value));
  },
  onCampaignProgress: (callback: (data: any) => void) => {
    ipcRenderer.removeAllListeners('campaign-progress');
    ipcRenderer.on('campaign-progress', (_event, value) => callback(value));
  },
  onCampaignInit: (callback: (data: any) => void) => {
    ipcRenderer.removeAllListeners('campaign-init');
    ipcRenderer.on('campaign-init', (_event, value) => callback(value));
  },
  onCampaignStopped: (callback: () => void) => {
    ipcRenderer.removeAllListeners('campaign-stopped');
    ipcRenderer.on('campaign-stopped', () => callback());
  }
});
