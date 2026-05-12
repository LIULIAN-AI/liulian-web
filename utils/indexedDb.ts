/**
 * IndexedDB 工具类，用于处理数据的本地存储
 */
class IndexedDBUtil {
  private dbName: string;
  private storeName: string;
  private db: IDBDatabase | null;
  constructor(dbName = 'formDataDB', storeName = 'formData') {
    this.dbName = dbName;
    this.storeName = storeName;
    this.db = null;
  }

  /**
   * 检查浏览器环境
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
  }

  /**
   * 打开数据库连接
   */
  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (!this.isBrowser()) {
        reject(new Error('IndexedDB is not available in this environment'));
        return;
      }
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db =  (event.target as IDBOpenDBRequest).result;
        // 创建对象存储空间
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  /**
   * 将 IDBRequest 转换为 Promise
   */
  private promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 保存数据到 IndexedDB
   * @param {String} id - 数据唯一标识符（可以用页面路径作为id）
   * @param {Object} data - 要保存的数据
   */
  async saveData(id: string, data: any) : Promise<boolean> {
    try {
      if (!this.isBrowser()) return false;
      if (!this.db) {
        await this.openDB();
      }
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      // 保存数据，包含时间戳
      await this.promisifyRequest(store.put({
        id,
        data,
        timestamp: new Date().getTime()
      }));
      
      return true;
    } catch (error) {
      console.error('保存数据失败:', error);
      return false;
    }
  }

  /**
   * 从 IndexedDB 读取数据
   * @param {String} id - 数据唯一标识符
   */
  async getData(id:string) : Promise<any | null> {
    try {
      if (!this.isBrowser()) return null;
      if (!this.db) {
        await this.openDB();
      }
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const result = await this.promisifyRequest(store.get(id));
      return result ? result.data : null;
    } catch (error) {
      console.error('读取数据失败:', error);
      return null;
    }
  }

  /**
   * 删除指定数据
   * @param {String} id - 数据唯一标识符
   */
  async deleteData(id:string) : Promise<boolean> {
    try {
      if (!this.isBrowser()) return false;
      if (!this.db) {
        await this.openDB();
      }
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      await this.promisifyRequest(store.delete(id));
      return true;
    } catch (error) {
      console.error('删除数据失败:', error);
      return false;
    }
  }
}

export default IndexedDBUtil;