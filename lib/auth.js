const ADMIN_CODE = process.env.ADMIN_CODE || '8888'

export function checkAdminCode(code) {
  return String(code || '') === ADMIN_CODE
}
