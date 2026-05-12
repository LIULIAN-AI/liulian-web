/**
 * 编译监控工具
 * 用于检测和诊断Next.js开发模式下的频繁编译问题
 */

export class CompilationMonitor {
  private static compilationCount = 0;
  private static lastCompilationTime = 0;
  private static compilationTimes: number[] = [];
  private static isMonitoring = false;

  /**
   * 开始监控编译
   */
  static startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.compilationCount = 0;
    this.compilationTimes = [];
    
    console.log('🔍 开始监控Next.js编译...');
    
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.logCompilationStats();
      }
    });
  }

  /**
   * 记录编译事件
   */
  static recordCompilation() {
    const now = Date.now();
    const timeSinceLastCompilation = now - this.lastCompilationTime;
    
    this.compilationCount++;
    this.compilationTimes.push(timeSinceLastCompilation);
    this.lastCompilationTime = now;
    
    // 如果编译频率过高，发出警告
    if (this.compilationCount > 10 && timeSinceLastCompilation < 1000) {
      console.warn('⚠️ 检测到频繁编译！');
      console.warn(`编译次数: ${this.compilationCount}`);
      console.warn(`距离上次编译: ${timeSinceLastCompilation}ms`);
      this.suggestSolutions();
    }
  }

  /**
   * 记录页面访问
   */
  static recordPageAccess(pageName: string) {
    console.log(`📄 访问页面: ${pageName}`);
    console.log(`当前编译次数: ${this.compilationCount}`);
    
    if (this.compilationCount > 5) {
      console.warn(`⚠️ 页面 ${pageName} 触发了 ${this.compilationCount} 次编译！`);
    }
  }

  /**
   * 获取编译统计
   */
  static getCompilationStats() {
    const avgTime = this.compilationTimes.length > 0 
      ? this.compilationTimes.reduce((a, b) => a + b, 0) / this.compilationTimes.length 
      : 0;
    
    return {
      totalCompilations: this.compilationCount,
      averageTimeBetweenCompilations: Math.round(avgTime),
      isHighFrequency: this.compilationCount > 10 && avgTime < 1000
    };
  }

  /**
   * 记录编译统计
   */
  static logCompilationStats() {
    const stats = this.getCompilationStats();
    
    console.log('📊 编译统计报告:');
    console.log('='.repeat(40));
    console.log(`总编译次数: ${stats.totalCompilations}`);
    console.log(`平均编译间隔: ${stats.averageTimeBetweenCompilations}ms`);
    console.log(`高频编译: ${stats.isHighFrequency ? '是' : '否'}`);
    console.log('='.repeat(40));
    
    if (stats.isHighFrequency) {
      this.suggestSolutions();
    }
  }

  /**
   * 建议解决方案
   */
  private static suggestSolutions() {
    console.log('💡 建议解决方案:');
    console.log('1. 检查useEffect依赖项是否导致无限循环');
    console.log('2. 检查useCallback和useMemo的依赖项');
    console.log('3. 检查组件状态更新是否触发不必要的重新渲染');
    console.log('4. 检查是否有函数在每次渲染时重新创建');
    console.log('5. 考虑使用React.memo优化组件');
  }

  /**
   * 重置监控
   */
  static reset() {
    this.compilationCount = 0;
    this.compilationTimes = [];
    this.lastCompilationTime = 0;
    console.log('🔄 编译监控已重置');
  }

  /**
   * 停止监控
   */
  static stopMonitoring() {
    this.isMonitoring = false;
    console.log('⏹️ 编译监控已停止');
  }
}

// 在开发模式下自动开始监控
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  CompilationMonitor.startMonitoring();
}
