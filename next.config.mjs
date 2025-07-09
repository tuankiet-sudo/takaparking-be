/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // This applies the headers to all routes in your application
        source: "/api/:path*",
        headers: [
          // This allows your frontend origin to make requests
          {
            key: "Access-Control-Allow-Origin",
            value: "*", // Allows all origins. For production, you might want to restrict this to your frontend's domain.
          },
          // Allowed HTTP methods
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PATCH, DELETE, OPTIONS",
          },
          // Allowed headers
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
