"use client";

import { useState } from 'react';
import { RequestHistory, HistoryItem } from './RequestHistory';
import { RequestBuilder, RequestState } from './RequestBuilder';
import { ResponseViewer } from './ResponseViewer';
import { ApiService, APIResponse } from './ApiService';
import { registry } from '@devos/kernel';
import type { VirtualFileSystem } from '@devos/filesystem';

const HISTORY_FILE = '/home/user/.devos/api-history.json';

export default function ApiTesterApp() {
  const [reqState, setReqState] = useState<RequestState>({
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    headers: [{ key: 'Content-Type', value: 'application/json', active: true }, { key: '', value: '', active: true }],
    body: '{\n  "title": "foo",\n  "body": "bar",\n  "userId": 1\n}',
    auth: { type: 'none', token: '' }
  });

  const [response, setResponse] = useState<APIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [historyRefresh, setHistoryRefresh] = useState(0);

  const handleSend = async () => {
    if (!reqState.url) return;
    setIsLoading(true);
    setResponse(null);

    // Build headers
    const headersToUse: Record<string, string> = {};
    reqState.headers.filter(h => h.active && h.key.trim()).forEach(h => {
      headersToUse[h.key.trim()] = h.value.trim();
    });

    if (reqState.auth.type === 'bearer' && reqState.auth.token) {
      headersToUse['Authorization'] = `Bearer ${reqState.auth.token}`;
    }

    const payload = reqState.method !== 'GET' && reqState.method !== 'HEAD' ? reqState.body : undefined;

    const res = await ApiService.sendRequest({
      method: reqState.method,
      url: reqState.url,
      headers: headersToUse,
      data: payload
    });

    setResponse(res);
    setIsLoading(false);

    // Save history
    try {
      const vfs = registry.get<VirtualFileSystem>('filesystem');

      // Ensure .devos directory exists before writing
      try { await vfs.getNode('/home/user/.devos'); }
      catch { await vfs.createDirectory('/home/user/.devos'); }

      let history: HistoryItem[] = [];
      if (await vfs.exists(HISTORY_FILE)) {
        const content = await vfs.readFile(HISTORY_FILE);
        if (content) history = JSON.parse(content);
      }
      
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        method: reqState.method,
        url: reqState.url,
        timestamp: Date.now(),
        headers: headersToUse,
        data: payload
      };
      
      history = [newItem, ...history].slice(0, 20); // Keep last 20
      await vfs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2));
      setHistoryRefresh(prev => prev + 1);
    } catch (err) {
      console.error('Failed to save API history', err);
    }
  };

  const handleSelectHistory = (item: HistoryItem) => {
    const newHeaders = Object.entries(item.headers || {}).map(([key, value]) => ({ key, value, active: true }));
    newHeaders.push({ key: '', value: '', active: true });

    let authType: 'none' | 'bearer' = 'none';
    let token = '';
    
    // Extract auth if present
    const authHeaderIndex = newHeaders.findIndex(h => h.key.toLowerCase() === 'authorization');
    if (authHeaderIndex !== -1) {
      const val = newHeaders[authHeaderIndex].value;
      if (val.toLowerCase().startsWith('bearer ')) {
        authType = 'bearer';
        token = val.substring(7);
        // Remove it from plain headers since we map it to Auth tab
        newHeaders.splice(authHeaderIndex, 1);
      }
    }

    setReqState({
      method: item.method,
      url: item.url,
      headers: newHeaders.length > 0 ? newHeaders : [{ key: '', value: '', active: true }],
      body: typeof item.data === 'object' ? JSON.stringify(item.data, null, 2) : (item.data || ''),
      auth: { type: authType, token }
    });
  };

  return (
    <div className="flex h-full w-full bg-desktop overflow-hidden text-foreground">
      {/* Left Sidebar */}
      <RequestHistory 
        onSelect={handleSelectHistory} 
        refreshTrigger={historyRefresh}
      />
      
      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <RequestBuilder 
          state={reqState}
          onChange={setReqState}
          onSend={handleSend}
          isLoading={isLoading}
        />
        <ResponseViewer 
          response={response}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
