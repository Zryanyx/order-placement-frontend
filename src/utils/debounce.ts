// 适用于validator的防抖函数实现，正确返回Promise
export function debounce<T extends (...args: any[]) => Promise<any>>(  
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<any> {
  let timeout: number | null = null;

  return function executedFunction(...args: Parameters<T>): Promise<any> {
    // 返回一个Promise，确保validator函数能够正常工作
    return new Promise((resolve, reject) => {
      const later = async () => {
        timeout = null;
        try {
          const result = await func(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(later, wait);
    });
  };
}

