import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/videos/:path*.webm",
        headers: [{ key: "Content-Type", value: "video/webm" }],
      },
    ];
  },
};

export default nextConfig;
