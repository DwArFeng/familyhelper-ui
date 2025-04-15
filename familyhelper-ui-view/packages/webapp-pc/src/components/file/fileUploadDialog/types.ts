export type FileTestResult = true | { passed: boolean; message: string }

export type FileTester = (file: File) => FileTestResult
