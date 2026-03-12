import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@devos/ui", "@devos/kernel", "@devos/filesystem", "@devos/types"]
};

export default nextConfig;
