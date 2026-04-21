import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => ipcRenderer.invoke('ping'),
  saveSettings: (settings: any) => ipcRenderer.send('save-settings', settings),
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
