"use client";

import { Desktop } from '@/components/desktop';
import { BootScreen } from '@/components/boot/BootScreen';

export default function Home() {

  return (
    <>
      <BootScreen />
      {/* Conditionally reveal desktop so it mounts properly or just keep it mounted underneath? Keeping it mounted but hidden using opacity or pointer events, or just let BootScreen overlay it since BootScreen has high z-index and exit animations. Let's just render Desktop unconditionally, BootScreen overlays it with z-50 and is removed when done! */}
      <Desktop />
    </>
  );
}
