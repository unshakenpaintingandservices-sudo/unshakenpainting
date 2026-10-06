interface InquiryEnvironment {
  targetEnvironment?: string;
  environment?: string;
  explicitMode?: string;
  explicitEndpoint?: string;
}

/** Called only while rendering; return only public form configuration. */
export function resolveInquiryConfig(environment: InquiryEnvironment): {
  mode: 'live' | 'preview';
  endpoint: string;
} {
  // A custom/empty target must not fall through to a broader production env.
  const production =
    (environment.targetEnvironment ?? environment.environment) === 'production';
  return {
    mode:
      production || environment.explicitMode === 'live' ? 'live' : 'preview',
    endpoint: production
      ? '/api/contact/'
      : environment.explicitEndpoint || '/api/contact/',
  };
}
