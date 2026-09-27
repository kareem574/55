// Audio & Vibration for WhatsApp-style notifications
let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!sharedAudioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        sharedAudioCtx = new AudioCtx();
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume();
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

/**
 * Authentic WhatsApp-style incoming message chime synthesized using Web Audio API
 */
export function playWhatsAppChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Note 1: High crisp pop (830Hz - G#5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(830.61, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.12);

    // Note 2: Characteristic WhatsApp chime (1174.66Hz - D6)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1174.66, now + 0.07);
    osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.22); // E6

    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.24, now + 0.07);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.07);
    osc2.stop(now + 0.35);

    // Mobile vibration pattern (like WhatsApp message receipt)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([120, 60, 120]);
    }
  } catch {
    // Autoplay restrictions handle gracefully
  }
}

export function playUpdateChime() {
  playWhatsAppChime();
}

/**
 * Request system notifications permission (Desktop & Android Chrome)
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch {
    return false;
  }
}

/**
 * Send System / OS Notification (shows in phone notification shade or desktop corner)
 */
export function sendWhatsAppSystemNotification(title: string, body: string) {
  playWhatsAppChime();

  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body,
        icon: '/app-icon.svg',
        badge: '/app-icon.svg',
        tag: 'nasr-city-request',
        silent: false,
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch {
      // Fallback
    }
  }
}
