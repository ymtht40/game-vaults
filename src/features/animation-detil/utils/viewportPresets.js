
import {
  ArrowsOutIcon,
  DeviceTabletIcon,
  LaptopIcon,
  DesktopIcon,
  DeviceMobileIcon
} from '@phosphor-icons/react';

export const viewportPresets = [
  {
    id: 'full',
    label: 'Full',
    w: null,
    Icon: ArrowsOutIcon,
  },
  {
    id: 'mobile',
    label: 'Mobile',
    w: 375,
    Icon: DeviceMobileIcon,
  },
  {
    id: 'tablet',
    label: 'Tablet',
    w: 768,
    Icon: DeviceTabletIcon,
  },
  {
    id: 'laptop',
    label: 'Laptop',
    w: 1024,
    Icon: LaptopIcon,
  },
  {
    id: 'desktop',
    label: 'Desktop',
    w: 1440,
    Icon: DesktopIcon,
  },
];

export const defaultViewportWidth =
  viewportPresets.find((preset) => preset.id === 'desktop')?.w ?? null;