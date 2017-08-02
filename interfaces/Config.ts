export interface ProjectConfiguration {
  executionEnvironment: string,
  buildEnvironment: string,
  host: string,
  port: number,
  apiURL: string,
  baseURL: string,
  baseName: string,
  apiKey: string,
  loginURL?: string,
  logoutURL?: string,
  title: string,
  publicPath: string,

  /** Analytics & Bug reporting */
  bugherd?: string,
  heap?: string,
  mixpanel?: string,
  raygun?: string,
  s3Path?: string,
  ga_tracking_code?: string
}