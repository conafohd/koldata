export class CommonFormService {
    public static validateEmail(email: string) {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    }
    
    public static sanitizeFormData<T extends Record<string, any>>(data: T): T {
    const sanitized = { ...data } as { [key: string]: any }
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = sanitized[key].trim()
      }
    })

    return sanitized as T
  }
}