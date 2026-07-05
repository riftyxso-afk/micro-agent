import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { RightPanel } from './components/RightPanel';
import { LIVE_MATCHES, NEWS_ITEMS } from './data';
import { ChatMessage, MenuId, QuickAction } from './types';

let messageIdCounter = 0;
const generateId = () => `msg-${++messageIdCounter}-${Date.now()}`;

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Selamat datang di GoalMind AI! Tanyakan apa saja tentang Piala Dunia 2026.\n\nSaya bisa membantu Anda dengan:\n• Skor dan hasil pertandingan\n• Prediksi dan analisis\n• Jadwal pertandingan\n• Klasemen grup\n• Formasi dan taktik\n\nSilakan bertanya atau gunakan quick action di bawah!',
  timestamp: new Date(),
};

export const GoalMindDashboard: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<MenuId>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSendMessage = useCallback((text: string) => {
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: generateAIResponse(text),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 800);
  }, []);

  const handleQuickAction = useCallback((action: QuickAction) => {
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: action.label,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: action.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 500);
  }, []);

  return (
    <div className="flex h-screen bg-[#0d1b2a] overflow-hidden">
      <Sidebar
        activeMenu={activeMenu}
        onMenuChange={setActiveMenu}
        liveMatchCount={LIVE_MATCHES.length}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <ChatArea
        messages={messages}
        onSendMessage={handleSendMessage}
        onQuickAction={handleQuickAction}
        onMenuClick={() => setSidebarOpen(true)}
      />

      <RightPanel
        liveMatches={LIVE_MATCHES}
        newsItems={NEWS_ITEMS}
      />
    </div>
  );
};

function generateAIResponse(query: string): string {
  const lower = query.toLowerCase();

  if (lower.includes('skor') || lower.includes('score') || lower.includes('hasil')) {
    return '🔥 Skor sementara:\n\n🇧🇷 Brasil 2 - 1 Jerman 🇩🇪\n⏱️ Menit 67\n⚽ Neymar (32\'), Vinicius (58\')\n⚽ Musiala (45+1\')\n📊 Penguasaan bola: 48% - 52%\n\n🇪🇸 Spanyol 0 - 0 Maroko 🇲🇦\n⏱️ Menit 23\n\n🇫🇷 Prancis 1 - 0 Senegal 🇸🇳\n⏱️ Menit 45\n⚽ Mbappé (38\')';
  }

  if (lower.includes('prediksi') || lower.includes('prediction')) {
    return '🧠 Prediksi Hari Ini:\n\n1. 🇧🇷 Brasil vs Jerman 🇩🇪\n   Peluang: Brasil 52% | Seri 26% | Jerman 22%\n\n2. 🇦🇷 Argentina vs Maroko 🇲🇦\n   Peluang: Argentina 55% | Seri 25% | Maroko 20%\n\n3. 🇫🇷 Prancis vs Senegal 🇸🇳\n   Peluang: Prancis 60% | Seri 22% | Senegal 18%';
  }

  if (lower.includes('jadwal') || lower.includes('schedule')) {
    return '📅 Jadwal Pertandingan Hari Ini:\n\n🕐 17:00 WIB - Brasil vs Jerman\n📍 Stadium MetLife, New York\n\n🕐 20:00 WIB - Spanyol vs Maroko\n📍 Stadium AT&T, Dallas\n\n🕐 23:00 WIB - Prancis vs Senegal\n📍 Stadium SoFi, Los Angeles';
  }

  if (lower.includes('klasemen') || lower.includes('standing') || lower.includes('grup')) {
    return '🏆 Klasemen Grup A:\n\n1. 🇳🇱 Belanda    6 pts (+3)\n2. 🇪🇨 Ekuador    3 pts (0)\n3. 🇸🇳 Senegal    3 pts (-1)\n4. 🇶🇦 Qatar       0 pts (-2)';
  }

  if (lower.includes('formasi') || lower.includes('formation') || lower.includes('pemain')) {
    return '⚽ Formasi Brasil (4-3-3):\n\n```\n         Richarlison\n  Raphinha    Vinicius Jr\n\n    Paquetá  Casemiro  B. Guimarães\n\n  Sandro  T. Silva  Marquinhos  Danilo\n\n           Alisson\n```\n\nFormasi ini memungkinkan Brasil bermain ofensif dengan sayap yang cepat.';
  }

  if (lower.includes('brasil') || lower.includes('brazil')) {
    return '🇧🇷 Brasil di Piala Dunia 2026:\n\n• Peluang juara: 15%\n• Pemain kunci: Neymar, Vinicius Jr, Rodrygo\n• Formasi favorit: 4-3-3\n• Kekuatan: Serangan balik cepat\n• Kelemahan: Pertahanan sayap\n\nBrasil tampil konsisten di fase grup dengan 2 kemenangan dari 2 pertandingan.';
  }

  if (lower.includes('argentina') || lower.includes('messi')) {
    return '🇦🇷 Argentina di Piala Dunia 2026:\n\n• Peluang juara: 20%\n• Pemain kunci: Messi, Álvarez, Mac Allister\n• Formasi favorit: 4-3-3\n• Kekuatan: Kolaborasi tim\n• Kelemahan: Ketergantungan pada Messi\n\nArgentina memulai kampanye dengan hasil imbang 1-1 melawan Arab Saudi.';
  }

  return `Terima kasih atas pertanyaan Anda tentang "${query}".\n\nSebagai GoalMind AI, saya sedang menganalisis data pertandingan terkini untuk memberikan Anda jawaban yang akurat.\n\nApakah Anda ingin bertanya tentang:\n• Skor pertandingan live\n• Prediksi hasil\n• Jadwal pertandingan\n• Klasemen grup\n• Formasi dan taktik`;
}
