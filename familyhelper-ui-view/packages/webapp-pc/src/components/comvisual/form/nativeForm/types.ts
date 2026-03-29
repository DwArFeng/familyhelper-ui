// noinspection JSUnusedGlobalSymbols,DuplicatedCode

/** 与 el-form `model` 一致：任意键的表单根类型（注入键与默认泛型参数使用） */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 表单数据需容纳任意嵌套结构
export type NativeFormModel = Record<string, any>

export type NativeFormRule<CT extends NativeFormModel = NativeFormModel> = {
  required?: boolean
  message?: string
  validator?: (value: unknown, model: CT) => boolean | string | Promise<boolean | string>
}

export type NativeFormRules<CT extends NativeFormModel = NativeFormModel> = Partial<
  Record<string, NativeFormRule<CT> | NativeFormRule<CT>[]>
>

export type ValidateFieldError = { message: string }

export type ValidateFieldsError = Partial<Record<string, ValidateFieldError[]>>

export type FormValidateCallback = (
  isValid: boolean,
  invalidFields?: ValidateFieldsError,
) => void | Promise<void>
