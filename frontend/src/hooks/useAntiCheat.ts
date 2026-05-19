"use client";

import { useEffect, useRef, useCallback } from "react";
import { getSocket } from "@/lib/socket";

interface AntiCheatConfig {
  sessionId: string;
  enabled: boolean;
}

interface FlagCounts {
  tab_switch: number;
  paste: number;
  blur: number;
  usb: number;
}

export function useAntiCheat({ sessionId, enabled }: AntiCheatConfig) {
  const flagCountRef = useRef<FlagCounts>({ tab_switch: 0, paste: 0, blur: 0, usb: 0 });

  const reportFlag = useCallback(
    (flagType: string, metadata?: Record<string, unknown>) => {
      const socket = getSocket();
      socket.emit("flag:report", { sessionId, flagType, metadata });
    },
    [sessionId],
  );

  useEffect(() => {
    if (!enabled) return;

    function onVisibilityChange() {
      if (document.hidden) {
        flagCountRef.current.tab_switch++;
        reportFlag("TAB_SWITCH", { count: flagCountRef.current.tab_switch });
      }
    }

    function onBlur() {
      flagCountRef.current.blur++;
      reportFlag("WINDOW_BLUR", { count: flagCountRef.current.blur });
    }

    function onPaste(e: ClipboardEvent) {
      e.preventDefault();
      flagCountRef.current.paste++;
      reportFlag("PASTE_EVENT", { count: flagCountRef.current.paste });
    }

    function onContextMenu(e: MouseEvent) {
      e.preventDefault();
    }

    function onUsbConnect(event: Event) {
      const device = (event as USBConnectionEvent).device;
      flagCountRef.current.usb++;
      reportFlag("USB_DETECTED", {
        action: "connect",
        productName: device?.productName,
        manufacturerName: device?.manufacturerName,
        count: flagCountRef.current.usb,
      });
    }

    function onUsbDisconnect(event: Event) {
      const device = (event as USBConnectionEvent).device;
      reportFlag("USB_DETECTED", {
        action: "disconnect",
        productName: device?.productName,
      });
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);
    document.addEventListener("paste", onPaste);
    document.addEventListener("contextmenu", onContextMenu);

    const usbApi = (navigator as Navigator & { usb?: USB }).usb;
    if (usbApi) {
      usbApi.addEventListener("connect", onUsbConnect);
      usbApi.addEventListener("disconnect", onUsbDisconnect);
      usbApi.getDevices().then((devices) => {
        if (devices.length > 0) {
          reportFlag("USB_DETECTED", {
            action: "initial_scan",
            deviceCount: devices.length,
            devices: devices.map((d) => ({ productName: d.productName })),
          });
        }
      }).catch(() => {});
    }

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("contextmenu", onContextMenu);
      if (usbApi) {
        usbApi.removeEventListener("connect", onUsbConnect);
        usbApi.removeEventListener("disconnect", onUsbDisconnect);
      }
    };
  }, [enabled, reportFlag]);

  return { flagCount: flagCountRef.current };
}
