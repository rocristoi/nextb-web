import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      { pathname: "/vehicles/**" },
      { pathname: "/credits/**" },
      { pathname: "/icons/**" },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "forum.metrouusor.com",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "mo-bi.ro",
        pathname: "/sites/default/files/**",
      },
    ],
  },
  serverExternalPackages: ["unzipper"],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@aws-sdk/client-s3": false,
    };
    return config;
  },
};

export default withSerwist(nextConfig);
