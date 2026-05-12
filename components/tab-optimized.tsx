'use client';
import { useRouter, usePathname, useParams } from "next/navigation";
import styles from '@/app/(default)/bank-info/[sortId]/overview/overview.module.css';
import { useEffect, useState, useCallback, memo } from "react";
import { useBankContext } from "@/contexts/BankContext";
import { Tag } from "antd";
import { useOptimizedNavigation, useSmartPrefetch } from "@/utils/navigation";

const navItems = [
    { label: 'Overview', path: '/overview' },
    { label: 'Products', path: '/products' },
    { label: 'Marketing', path: '/marketing' },
    { label: 'Financials', path: '/financials' },
    { label: 'Staff', path: '/staff' },
    { label: 'Tech', path: '/tech' },
    { label: 'Web3.0', path: '/web3' },
];

interface TabProps {
    sortId: string;
}

const NavigationBar = memo(function NavigationBar({ sortId }: TabProps) {
    const [currentPath, setCurrentPath] = useState('');
    
    const router = useRouter();
    const pathname = usePathname();
    
    // 使用共享的银行上下文
    const { headerInfo, loading, loadHeaderInfo } = useBankContext();
    
    // 使用优化的导航Hook
    const { navigate, prefetch } = useOptimizedNavigation();
    const { prefetchRelated } = useSmartPrefetch();

    // 只在 sortId 变化时加载数据
    useEffect(() => {
        if (sortId) {
            loadHeaderInfo(sortId);
            // 智能预加载相关页面
            prefetchRelated(pathname);
        }
    }, [sortId, pathname, loadHeaderInfo, prefetchRelated]);

    // 处理Back按钮点击事件
    const handleBackClick = useCallback(() => {
        navigate('/', { prefetch: true });
    }, [navigate]);

    // 处理tab导航点击事件 - 使用优化的导航
    const handleTabClick = useCallback((targetPath: string) => {
        const fullPath = `/bank-info/${sortId}${targetPath}`;
        
        // 如果点击的是当前页面，不做任何操作
        if (pathname === fullPath) return;
        
        console.log('切换到页面:', targetPath, '时间:', new Date().toISOString());
        setCurrentPath(targetPath);
        
        // 使用优化的导航函数
        navigate(fullPath, { prefetch: true, delay: 30 });
    }, [navigate, sortId, pathname]);

    // 监听路径变化，当页面加载完成后清除加载状态
    useEffect(() => {
        if (currentPath && pathname.endsWith(currentPath)) {
            // 页面已经加载完成，清除加载状态
            const timer = setTimeout(() => {
                setCurrentPath('');
            }, 200); // 稍微增加延迟确保页面完全渲染
            
            return () => clearTimeout(timer);
        }
        return;
    }, [pathname, currentPath]);

    // 添加页面可见性检测，确保在页面切换时正确清除状态
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && currentPath) {
                // 页面变为可见时，检查是否需要清除加载状态
                const timer = setTimeout(() => {
                    setCurrentPath('');
                }, 100);
                return () => clearTimeout(timer);
            }
            return;
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [currentPath]);

    // ZAbank头部内容
    const header = (
        <div className={styles.bankSectionHeader}>
            <div className={styles.exampleDashboardCard}>
                <div className={styles.container6}>
                    <div className={styles.container7}>
                        <div className={styles.button} onClick={handleBackClick}>
                            <img className={styles.arrowLeftminiIcon} alt="" src="/images/tech/arrow-leftMini.svg" />
                            <div className={styles.label}>Back</div>
                        </div>
                    </div>
                    <div className={styles.container8}>
                        <div className={styles.container9}>
                            <div className={styles.zaBank}>{headerInfo?.companyName || 'Loading...'}</div>
                            <div className={`${styles.background} ${headerInfo?.status === "Live" ? '' : styles.redStyle}`}  />
                            <div className={`${styles.live} ${headerInfo?.status === 'Live' ? '' : styles.redFont}`}>{headerInfo?.status || 'Loading...'}</div>
                        </div>
                        <div className={styles.container10}>
                            <div className={styles.container7}>
                                <div className={styles.badgeList}>
                                    <div className={styles.badges}>
                                        {headerInfo?.tag && headerInfo.tag.length > 0 && headerInfo.tag.map((badge, index) => (
                                            <div key={index} className={styles.badge}>
                                                <div className={styles.badgeChild} />
                                                <div className={styles.badge1}>{badge}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className={styles.leaprateForexTrading}>Leaprate Forex Trading News</div>
                                </div>
                            </div>
                            <div className={styles.hongKong}>{headerInfo?.location || 'Loading...'}</div>
                        </div>
                    </div>
                </div>
                <img
                    className={styles.pxZaBankLogosvgpngIcon}
                    alt=""
                    src={headerInfo?.logoLink || "/images/defaultBank.svg"}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/defaultBank.svg";
                    }}
                />
            </div>
        </div>
    );

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            {header}
            <div className={styles.container11}>
                {navItems.map((item) => {
                    const isActive = pathname.endsWith(item.path);
                    const isTargetPath = currentPath === item.path;
                    
                    return (
                        <button
                            key={item.path}
                            className={`
                                ${isActive ? styles.button2 : styles.button4}
                                ${isTargetPath ? styles.buttonNavigating : ''}
                            `}
                            onClick={() => handleTabClick(item.path)}
                        >
                            <div className={styles.label}>
                                {isTargetPath ? 'Loading...' : item.label}
                            </div>
                        </button>
                    );
                })}
            </div>
            <div className={styles.line} />
            
            {/* 显示加载状态 */}
            {currentPath && (
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <div className={styles.loadingText}>正在加载 {navItems.find(item => item.path === currentPath)?.label} 页面...</div>
                </div>
            )}
        </>
    );
});

export default NavigationBar;
