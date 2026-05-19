interface USBDevice {
  productName?: string;
  manufacturerName?: string;
  serialNumber?: string;
  vendorId: number;
  productId: number;
}

interface USBConnectionEvent extends Event {
  device: USBDevice;
}

interface USB extends EventTarget {
  getDevices(): Promise<USBDevice[]>;
  addEventListener(type: "connect" | "disconnect", listener: (event: USBConnectionEvent) => void): void;
  removeEventListener(type: "connect" | "disconnect", listener: (event: USBConnectionEvent) => void): void;
}

interface Navigator {
  usb?: USB;
}
