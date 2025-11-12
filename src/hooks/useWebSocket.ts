import { useState, useEffect, useRef } from 'react';
import { API_BASE } from '../config/api'; // 1. Import API_BASE

const useWebSocket = (onMessage) => {
  const ws = useRef(null);

  useEffect(() => {
    // 2. Construct WebSocket URL from API_BASE
    const wsUrl = API_BASE.replace(/^http/, 'ws');
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected to:', wsUrl);
    };

    ws.current.onclose = (event) => {
      console.log('WebSocket disconnected:', event.reason, `Code: ${event.code}`);
    };

    ws.current.onmessage = (event) => {
      console.log('Raw WebSocket message received:', event.data);
      try {
        const message = JSON.parse(event.data);
        if (onMessage) {
          onMessage(message);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Cleanup on unmount
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [onMessage]);

  return ws;
};

export default useWebSocket;
