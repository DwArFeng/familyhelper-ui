export declare type DefaultConfig = {
  commons: {
    logLevel: 'debug' | 'info' | 'warn' | 'error'
  }
  server: {
    open: boolean
    host: string
    port: number
    https: boolean
    hmr: boolean
  }
}

export declare const defaultConfig: DefaultConfig
export declare const configPath: string
