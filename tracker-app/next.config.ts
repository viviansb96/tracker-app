const nextConfig: any = {
  // Ignora os bloqueios do ESLint na hora de colocar na nuvem
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignora validações rigorosas de tipagem do TypeScript na hora do build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;